import React, {useCallback, useContext, useMemo} from 'react';
import {WiredButton, WiredCard, WiredInput} from './wired-elements-react';
import {
    blocksToRule,
    DirectionDescription,
    directionTokenFlatten,
    IUIItem,
    IUIList,
    IUIPage,
    IUIScene,
    ParseBlock,
    ParseBlocks,
} from './parse';
import {wireframeContext} from './store';
import {IToken} from 'chevrotain';
import {getPageHeight, getPageWidth} from './guides';

interface WireframeProps {
    sceneDescription: IUIScene | null;
    className?: string;
    onHover?: (tokens: IToken[]) => void;
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
        const classTokens = [Button, Field, Image, Header, Space].flat().filter(Boolean) as IToken[]
        onHover?.([...classTokens, ...valueTokens])
    }, [value, onHover])

    const onMouseLeave = useCallback(() => void onHover?.([]), [onHover])

    const elProps = {
        onMouseEnter, onMouseLeave,
    }

    if (Space) {
        return <div style={{flex: 1}} {...elProps}/>
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
            <div style={{flex: 1, textAlign: 'center', verticalAlign: 'center',
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

// TODO: [perf] Make a better grid renderer
const Direction = ({rule, flex, containerFlex, children}:
                     {rule: DirectionDescription, flex?: number, containerFlex?: number, children: JSX.Element[]}) =>
  <div style={{display: 'flex', flexDirection: rule.containerDirection, justifyContent: 'center', flex: containerFlex}}>
    {Array(rule.num).fill(0).map((_, i) =>
      <div style={{display: 'flex', flex, flexDirection: rule.direction}}>
          {children.filter((value, index) => index % rule.num === i)}
      </div>)}
</div>

const Block = ({block, onHover}: {
    block: ParseBlock,
    onHover?: (tokens: IToken[]) => void,
}) => {
    const {elements} = block.children;

    if (!elements?.length)
        return null;

    return <>
        {elements?.map(subblock => {
            const rule = directionTokenFlatten(subblock.children.direction)
            let containerFlex;
            const items: JSX.Element[] = []
            subblock.children.item?.forEach(innerItem => {
                if (innerItem.children.size) {
                    containerFlex = 1;
                }
                items.push(<Item item={innerItem} onHover={onHover}/>)
            })
            subblock.children.list?.forEach(innerList => {
                items.push(<WiredCard><List list={innerList} onHover={onHover}/></WiredCard>)
                items.push(<WiredCard><List list={innerList} onHover={onHover}/></WiredCard>)
                items.push(<WiredCard><List list={innerList} onHover={onHover}/></WiredCard>)
            })

            return <Direction rule={rule} containerFlex={containerFlex}>
                {items}
            </Direction>
        })}
    </>
}

const DirectedBlocks = ({blocks, onHover}: {blocks: ParseBlocks, onHover?: (tokens: IToken[]) => void}) => {
    const rule = useMemo(() => blocksToRule(blocks), [blocks])
    const containerFlex = useMemo(() => {
        // fixme: Figure out a clean way to merge this and the React-based graph traversal to bubble-up sizing
        // this is kinda meaningless and is used just for testing
        return rule.blocks.reduce((acc, block) =>
          acc + (block.children.elements?.reduce((acc2, subblock) =>
              acc2 + (subblock.children.item?.reduce((acc3, item) => acc3 + (item.children.size ? 1 : 0), 0) || 0)
            , 0) || 0), 0,
        )
    }, [rule])

    return <Direction rule={rule} flex={1} containerFlex={containerFlex}>
        {rule.blocks.map(block => <Block block={block} onHover={onHover} />)}
    </Direction>
}

const Page = ({page, onHover}: {page: IUIPage, onHover?: (tokens: IToken[]) => void}) => {
    const blocks = page.children.blocks.map((ref, key) =>
      <DirectedBlocks onHover={onHover} blocks={ref} key={key}/>)

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
