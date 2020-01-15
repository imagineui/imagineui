import React, {createContext, useCallback, useContext} from "preact/compat";
import {WiredButton, WiredInput, WiredDivider, WiredCard} from "./wired-elements-react";
import {ParseBlock, ParseItem, ParseList, ParsePage, ParseValue} from "./parse/ast";
import {wireframeContext} from "./nlp/nlp-store";
import {IToken} from "chevrotain";

interface WireframeProps {
    sceneDescription: ParseValue | null;
    className: string;
    onHover?: (tokens: IToken[]) => void;
}

const Item = ({item, onHover}: {item: ParseItem, onHover?: (tokens: IToken[]) => void}) => {
    const {Button, Field, Image, Header, value, literal} = item.children;

    const {state} = useContext(wireframeContext);
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
        return <div {...elProps}>
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

const Block = ({block, onHover}: {block: ParseBlock, onHover?: (tokens: IToken[]) => void}) => {
    return <>
        {block.children.item && block.children.item.map(item => <Item item={item} onHover={onHover}/>)}
        {block.children.list && block.children.list.map(list => <>
            <WiredCard><List list={list} onHover={onHover}/></WiredCard>
            <WiredCard><List list={list} onHover={onHover}/></WiredCard>
            <WiredCard><List list={list} onHover={onHover}/></WiredCard>
        </> )}
    </>
}
const Page = ({page, onHover}: {page: ParsePage, onHover?: (tokens: IToken[]) => void}) => <>{
        page.children.block.map((block,i) => <>
            <Block block={block} onHover={onHover}/>
            {i !== page.children.block.length - 1 ? <WiredDivider/> : null}
        </>)
    }</>

export const Wireframe = ({sceneDescription, className, onHover}: WireframeProps) => {
    return <div className={className}>
        {sceneDescription && sceneDescription.children.page.map((page, i) => <>
            <Page page={page} onHover={onHover}/>
            {/*{i !== page.children.block.length - 1 ? <WiredDivider elevation={4}/> : null}*/}
        </>)}
    </div>
}
