import React, {createContext, useCallback, useContext} from 'react';
import {WiredButton, WiredInput, WiredDivider, WiredCard} from './wired-elements-react';
import {
    numberTokenToNumber,
    ParseBlock,
    IUIItem,
    IUIList,
    IUIPage,
    IUITextValue,
    IUIScene, ParseDirection,
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
            text = StringLiteral[0].image.substring(1, StringLiteral[0].image.length - 1).replace(/\\"/g, '"')
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

const getSubblockToken = ({children}: ParseDirection) => (children.Rows || children.Columns)[0]

const Block = ({block, onHover}: {block: ParseBlock, onHover?: (tokens: IToken[]) => void}) => {
    const {direction, item, list} = block.children;

    const subblocks = direction?.sort((a, b) => (
            getSubblockToken(a).startOffset - getSubblockToken(b).startOffset
        )) || []

    // TODO: [tests] Validate that blocks are column-directed by default
    subblocks.unshift({
        children: {
            In: block.children.Block,
            Columns: block.children.Block,
            item,
            list,
        },
        name: 'direction',
    })

    if (subblocks.length === 0)
        return null;

    return <>
        {subblocks.map(subblock => {
            const num = subblock.children.number ? numberTokenToNumber(subblock.children.number[0]) : 1;

            const items: JSX.Element[] = []
            subblock.children.item?.forEach(innerItem => items.push(<Item item={innerItem} onHover={onHover}/>))
            subblock.children.list?.forEach(innerList => {
                items.push(<WiredCard><List list={innerList} onHover={onHover}/></WiredCard>)
                items.push(<WiredCard><List list={innerList} onHover={onHover}/></WiredCard>)
                items.push(<WiredCard><List list={innerList} onHover={onHover}/></WiredCard>)
            })

            // TODO: [perf] Make a better
            return <div style={{
                display: 'flex',
                flexDirection: subblock.children.Rows ? 'column' : 'row',
                justifyContent: 'center',
            }}>
                {Array(num).fill(0).map((_, i) =>
                    <div style={{display: 'flex', flexDirection: subblock.children.Rows ? 'row' : 'column'}}>
                    {items.filter((value, index) => index % num === i)}
                </div>)}
            </div>
        })}
    </>
}

interface AlignRule {
    name: 'columns' | 'rows'
    number: number
    blocks: string[]
}

const ruleToFrames =
    (blockRefs: Map<string, ParseBlock>, onHover?: (tokens: IToken[]) => void) => (rule: AlignRule, _: number) =>
    <div style={{display: 'flex', flexDirection: rule.name === 'rows' ? 'column' : 'row', justifyContent: 'center'}}>
        {Array(rule.number).fill(0).map((__, i) =>
            <div style={{display: 'flex', flex: 1, flexDirection: rule.name === 'rows' ? 'row' : 'column'}}>
                {rule.blocks.filter((value, index) => index % rule.number === i)
                    .map(block => <Block block={blockRefs.get(block)!} onHover={onHover}/>)}
            </div>)}
    </div>

const Page = ({page, onHover}: {page: IUIPage, onHover?: (tokens: IToken[]) => void}) => {

    const {block, blockalign} = page.children;

    const mentions = new Map<string, AlignRule>()
    const placedMention = new Set<string>()

    const alignRules = blockalign?.map((align): AlignRule => ({
            name: align.children.Rows ? 'rows' : 'columns',
            number: align.children.number ? numberTokenToNumber(align.children.number[0]) : 1,
            blocks: align.children.value.map(getTokenImage),
        })) ?? [];

    // TODO: [conformity] Throw an error on conflicting mentions
    alignRules.forEach(rule => rule.blocks.forEach(innerBlock => mentions.set(innerBlock, rule)))

    // const rules = block ? block.map(block => block.children.value.map(getTokenImage).join(', ')) : []

    const topRules: AlignRule[] = []
    const centerRules: AlignRule[] = []
    const bottomRules: AlignRule[] = []
    const blockRefs = new Map<string, ParseBlock>();
    const ruleRenderer = ruleToFrames(blockRefs, onHover)

    block?.forEach(ref => {
        const image = getTokenImage(ref.children.value[0])

        blockRefs.set(image, ref)

        if (placedMention.has(image))
            return

        const rule = mentions.get(image);

        const {Top, Center, Bottom} = ref.children;

        let rules = topRules;
        if (Center) rules = centerRules;
        if (Bottom) rules = bottomRules;

        if (rule) {
            rules.push(rule)
            rule.blocks.forEach(innerBlock => placedMention.add(innerBlock))
            return
        }

        rules.push({
            name: 'columns',
            number: 1,
            blocks: [image],
        })
        // TODO: [conformity] Throw an error on duplicates
        placedMention.add(image)
    })

    const topBlocks = topRules.map(ruleRenderer);
    const centerBlocks = centerRules.map(ruleRenderer);
    const bottomBlocks = bottomRules.map(ruleRenderer);

    const width = getPageWidth(page)
    const minHeight = getPageHeight(page) || 'unset'

    if (width) {
        return <WiredCard>
            <div style={{width, minHeight, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
                {topBlocks}
                <div style={{flex: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center'}}>{centerBlocks}</div>
                {bottomBlocks}
            </div>
        </WiredCard>
    } else {
        return <>
            {topBlocks}
            {centerBlocks}
            {bottomBlocks}
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
