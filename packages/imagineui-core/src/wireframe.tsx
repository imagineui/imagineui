import React, {createContext, useCallback, useContext} from "preact/compat";
import {WiredButton, WiredInput, WiredDivider, WiredCard} from "./wired-elements-react";
import {
    numberTokenToNumber,
    ParseBlock,
    ParseColumns,
    ParseItem,
    ParseList,
    ParsePage,
    ParseRows,
    ParseValue
} from "./parse/ast";
import {wireframeContext} from "./store";
import {IToken} from "chevrotain";

interface WireframeProps {
    sceneDescription: ParseValue | null;
    className?: string;
    onHover?: (tokens: IToken[]) => void;
}

const Item = ({item, onHover}: {item: ParseItem, onHover?: (tokens: IToken[]) => void}) => {
    const {Button, Field, Image, Header, value, literal} = item.children;

    const {state} = useContext(wireframeContext!);
    const {toNominativeCase} = state.nlp || {};

    let textEl = value || literal;
    let text = undefined;
    if(value && value[0].children.NaturalLiteral) {
        const {NaturalLiteral} = value[0].children;
        text = toNominativeCase ? toNominativeCase(NaturalLiteral[0].image) : NaturalLiteral[0].image
    } else if(textEl) {
        const {StringLiteral, Variable} = textEl[0].children;
        if(StringLiteral)
            text = StringLiteral[0].image.substring(1, StringLiteral[0].image.length-1)
        if(Variable)
            text = '[WIP] Подстановки переменных'
    }

    const onMouseEnter = useCallback(() => {
        const valueTokens = textEl ? Object.values(textEl[0].children).flat() : []
        const classTokens = [Button, Field, Image, Header].flat().filter(token => !!token)
        onHover && onHover([...classTokens, ...valueTokens])
    }, [value, onHover])

    const onMouseLeave = useCallback(() => {
        onHover && onHover([])
    }, [onHover])

    const elProps = {
        onMouseEnter, onMouseLeave
    }

    if(Button) {
        return <WiredButton {...elProps}>{text || Button[0].image}</WiredButton>
    }

    if(Field) {
        return <WiredInput {...elProps} placeholder={text || Field[0].image}></WiredInput>
    }

    if(Header) {
        return <h1 {...elProps}>{text || Header[0].image}</h1>
    }

    if(Image) {
        return <WiredCard fill="beige" elevation={2} {...elProps}>
            <div style={{width: 150, height: 150, textAlign: 'center', verticalAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'}}>
                {text || Image[0].image}
            </div>
        </WiredCard>
    }

    if(literal) {
        return <div {...elProps} style={{margin: 8}}>
            {text}
        </div>
    }

    return null;
}

const List = ({list, onHover}: {list: ParseList, onHover?: (tokens: IToken[]) => void}) => {
    if(list.children.item) {
        return <>
            {list.children.item.map(item => <Item item={item} onHover={onHover}/>)}
        </>
    }

    return <div>{list.children.List[0].image}</div>
}

const getSubblockToken = (subblock: ParseRows | ParseColumns) => {
    if(subblock.name === 'rows') {
        return subblock.children.Rows[0]
    } else {
        return subblock.children.Columns[0]
    }
}

const Block = ({block, onHover}: {block: ParseBlock, onHover?: (tokens: IToken[]) => void}) => {
    const {rows, columns, item, list} = block.children;

    const subblocks = [...(rows || []), ...(columns || [])]
        .sort((a, b) => (
            getSubblockToken(a).startOffset - getSubblockToken(b).startOffset
        ))

    // TODO: [tests] Validate that blocks are column-directed by default
    subblocks.unshift({
        children: {
            In: block.children.Block,
            Columns: block.children.Block,
            item,
            list
        },
        name: 'columns'
    })

    if(subblocks.length === 0)
        return null;

    return <>
        {subblocks.map(subblock => {
            const num = subblock.children.number ? numberTokenToNumber(subblock.children.number[0]) : 1;

            const items: React.JSX.Element[] = []
            subblock.children.item && subblock.children.item.forEach(item => items.push(<Item item={item} onHover={onHover}/>))
            subblock.children.list && subblock.children.list.forEach(list => {
                items.push(<WiredCard><List list={list} onHover={onHover}/></WiredCard>)
                items.push(<WiredCard><List list={list} onHover={onHover}/></WiredCard>)
                items.push(<WiredCard><List list={list} onHover={onHover}/></WiredCard>)
            })

            // TODO: [perf] Make a better
            return <div style={{display: 'flex', flexDirection: subblock.name === 'rows' ? 'column' : 'row'}}>
                {Array(num).fill(0).map((_, i) => <div style={{display: 'flex', flexDirection: subblock.name === 'rows' ? 'row' : 'column'}}>
                    {items.filter((value, index) => index % num == i)}
                </div>)}
            </div>
        })}
    </>
}
const Page = ({page, onHover}: {page: ParsePage, onHover?: (tokens: IToken[]) => void}) => page.children.block ? <>{
        page.children.block.map((block,i) => <>
            <Block block={block} onHover={onHover}/>
            {i !== page.children.block!.length - 1 ? <WiredDivider/> : null}
        </>)
    }</> : null;

export const Wireframe = ({sceneDescription, className, onHover}: WireframeProps) => {
    return <div className={className}>
        {sceneDescription && sceneDescription.children.page.map((page, i) => <>
            <Page page={page} onHover={onHover}/>
            {/*{i !== page.children.block.length - 1 ? <WiredDivider elevation={4}/> : null}*/}
        </>)}
    </div>
}
