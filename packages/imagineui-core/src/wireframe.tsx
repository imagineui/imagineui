import React from "preact/compat";
import {WiredButton, WiredInput, WiredDivider, WiredCard} from "./wired-elements-react";
import {ParseBlock, ParseItem, ParseList, ParsePage, ParseValue} from "./parse/ast";

interface WireframeProps {
    sceneDescription: ParseValue | null;
    className: string;
}

// <WiredInput placeholder="Placeholder"/>

const Item = ({item}: {item: ParseItem}) => {
    const {Button, Field, Image, Header, value, literal} = item.children;


    let textEl = value || literal;
    let text = undefined;
    if(value && value[0].children.NaturalLiteral) {
        const {NaturalLiteral} = value[0].children;
        text = NaturalLiteral[0].image
    } else if(textEl) {
        const {StringLiteral, Variable} = textEl[0].children;
        if(StringLiteral)
            text = StringLiteral[0].image.substring(1, StringLiteral[0].image.length-1)
        if(Variable)
            text = '[WIP] Подстановки переменных'
    }

    if(Button) {
        return <WiredButton>{text || Button[0].image}</WiredButton>
    }

    if(Field) {
        return <WiredInput placeholder={text || Field[0].image}></WiredInput>
    }

    if(Header) {
        return <h1>{text || Header[0].image}</h1>
    }

    if(Image) {
        return <WiredCard fill="beige" elevation={2}>
            <div style={{width: 150, height: 150, textAlign: 'center', verticalAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'}}>
                {text || Image[0].image}
            </div>
        </WiredCard>
    }

    if(literal) {
        return <div>
            {text}
        </div>
    }

    return null;
}

const List = ({list}: {list: ParseList}) => {
    if(list.children.item) {
        return <>
            {list.children.item.map(item => <Item item={item}/>)}
        </>
    }

    return <div>{list.children.List[0].image}</div>
}

const Block = ({block}: {block: ParseBlock}) => {
    return <>
        {block.children.item && block.children.item.map(item => <Item item={item}/>)}
        {block.children.list && block.children.list.map(list => <>
            <WiredCard><List list={list}/></WiredCard>
            <WiredCard><List list={list}/></WiredCard>
            <WiredCard><List list={list}/></WiredCard>
        </> )}
    </>
}
const Page = ({page}: {page: ParsePage}) => <>{
        page.children.block.map((block,i) => <>
            <Block block={block}/>
            {i !== page.children.block.length - 1 ? <WiredDivider/> : null}
        </>)
    }</>

export const Wireframe = ({sceneDescription, className}: WireframeProps) => {
    return <div className={className}>
        {sceneDescription && sceneDescription.children.page.map((page, i) => <>
            <Page page={page}/>
            {/*{i !== page.children.block.length - 1 ? <WiredDivider elevation={4}/> : null}*/}
        </>)}
    </div>
}
