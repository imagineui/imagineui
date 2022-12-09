import React, {useCallback, useContext} from 'react';
import {WiredButton, WiredCard, WiredInput} from './wired-elements-react';
import {
    AlignRule, blocksToRule,
    directionTokenFlatten,
    IUIItem,
    IUIList,
    IUIPage,
    IUIScene,
    IUITextValue,
    ParseBlock,
} from './parse';
import {wireframeContext} from './store';
import {IToken} from 'chevrotain';
import {getPageHeight, getPageWidth} from './guides';

interface WireframeProps {
    sceneDescription: IUIScene | null;
    className?: string;
    onHover?: (tokens: IToken[]) => void;
}

const getTokenImage = (literal: IUITextValue) => {
    const {NaturalLiteral, StringLiteral, Variable} = literal.children;
    if (NaturalLiteral)
        return NaturalLiteral[0].image
    if (StringLiteral)
        return StringLiteral[0].image.substring(1, StringLiteral[0].image.length - 1)
    if (Variable)
        return Variable[0].image.substring(1, Variable[0].image.length - 1)

    throw new Error('AST has returned a ParseTextValue without a text value')
}

const Item = ({item, onHover}: {item: IUIItem, onHover?: (tokens: IToken[]) => void}) => {
    const {Button, Field, Image, Header, Space, value, literal} = item.children;

    const {state} = useContext(wireframeContext!);
    const {toNominativeCase} = state.nlp || {};

    const textEl = value || literal;
    let text;
    if (value && value[0].children.NaturalLiteral) {
        const {NaturalLiteral} = value[0].children;
        text = toNominativeCase ? toNominativeCase(NaturalLiteral[0].image) : NaturalLiteral[0].image
    } else if (textEl) {
        const {StringLiteral, Variable} = textEl[0].children;
        if (StringLiteral)
            text = StringLiteral[0].image.substring(1, StringLiteral[0].image.length - 1)
              .replace(/\\(["«»\\])/g, (_, group) => group)
        if (Variable)
            text = '[WIP] Подстановки переменных'
    }

    const onMouseEnter = useCallback(() => {
        const valueTokens = textEl ? Object.values(textEl[0].children).flat() : []
        const classTokens = [Button, Field, Image, Header].flat().filter(Boolean) as IToken[]
        onHover?.([...classTokens, ...valueTokens])
    }, [value, onHover])

    const onMouseLeave = useCallback(() => void onHover?.([]), [onHover])

    const elProps = {
        onMouseEnter, onMouseLeave,
    }

    if (Space) {
        return <div style={{flex: 1}}/>
    }

    if (Button) {
        return <WiredButton {...elProps}>{text || Button[0].image}</WiredButton>
    }

    if (Field) {
        return <WiredInput {...elProps} style={{flex: 1}} placeholder={text || Field[0].image}></WiredInput>
    }

    if (Header) {
        return <h1 {...elProps}>{text || Header[0].image}</h1>
    }

    if (Image) {
        return <WiredCard fill='beige' elevation={2} {...elProps}>
            <div style={{width: 150, height: 150, textAlign: 'center', verticalAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'}}>
                {text || Image[0].image}
            </div>
        </WiredCard>
    }

    if (literal) {
        return <div {...elProps} style={{margin: 8}}>
            {text}
        </div>
    }

    return null;
}

const List = ({list, onHover}: {list: IUIList, onHover?: (tokens: IToken[]) => void}) => {
    if (list.children.item) {
        return <>
            {list.children.item.map(item => <Item item={item} onHover={onHover}/>)}
        </>
    }

    return <div>{list.children.List[0].image}</div>
}

const Block = ({block, onHover}: {block: ParseBlock, onHover?: (tokens: IToken[]) => void}) => {
    const {elements} = block.children;

    if (!elements?.length)
        return null;

    return <>
        {elements.map(subblock => {
            const {num, direction, containerDirection} = directionTokenFlatten(subblock.children.direction)

            const items: JSX.Element[] = []
            subblock.children.item?.forEach(innerItem => items.push(<Item item={innerItem} onHover={onHover}/>))
            subblock.children.list?.forEach(innerList => {
                items.push(<WiredCard><List list={innerList} onHover={onHover}/></WiredCard>)
                items.push(<WiredCard><List list={innerList} onHover={onHover}/></WiredCard>)
                items.push(<WiredCard><List list={innerList} onHover={onHover}/></WiredCard>)
            })

            // TODO: [perf] Make a better grid renderer
            return <div style={{
                display: 'flex',
                flexDirection: containerDirection,
                justifyContent: 'center',
            }}>
                {Array(num).fill(0).map((_, i) =>
                    <div style={{display: 'flex', flexDirection: direction}}>
                    {items.filter((value, index) => index % num === i)}
                </div>)}
            </div>
        })}
    </>
}

const Page = ({page, onHover}: {page: IUIPage, onHover?: (tokens: IToken[]) => void}) => {
    const blocks = page.children.blocks.map(ref => blocksToRule(ref)).map((rule, _) =>
      <div style={{display: 'flex', flexDirection: rule.containerDirection, justifyContent: 'center'}}>
          {Array(rule.num).fill(0).map((__, i) =>
            <div style={{display: 'flex', flex: 1, flexDirection: rule.direction}}>
                {rule.blocks.filter((value, index) => index % rule.num === i)
                  .map(block => <Block block={block} onHover={onHover}/>)}
            </div>)}
      </div>)

    const width = getPageWidth(page)
    const minHeight = getPageHeight(page) || 'unset'

    if (width) {
        return <WiredCard>
            <div style={{width, minHeight, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
                {blocks}
            </div>
        </WiredCard>
    } else {
        return <>
            {blocks}
        </>
    }
}

export const Wireframe = ({sceneDescription, className, onHover}: WireframeProps) => {
    let flexDirection: 'row' | 'column' = 'row'
    sceneDescription?.children.page.forEach(({children}) => {
        const {Mobile, Tablet, Widescreen} = children;
        if (!Mobile && !Tablet && !Widescreen) {
            flexDirection = 'column'
        }
    });
    return <div className={className} style={{flexDirection}}>
        {sceneDescription && sceneDescription.children.page.map((page, i) => <>
            <Page page={page} onHover={onHover}/>
            {/*{i !== page.children.block.length - 1 ? <WiredDivider elevation={4}/> : null}*/}
        </>)}
    </div>
}
