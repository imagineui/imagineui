import * as fs from 'fs';
import yaml from 'js-yaml';
import {SceneDescription} from '../types/logic';
import {SceneLexer, SceneParser} from "./grammar";
import {ILexingError, IRecognitionException, IToken} from "chevrotain";

// TODO: Implement scene parser
export function describeSceneFromAST(inputPath: string): SceneDescription {
    return yaml.safeLoad(fs.readFileSync(inputPath, 'utf8'));
}

export function parseSceneFromText(sceneText: string): SceneDescription {
    return {
        key: sceneText,
        areas: [],
        connectedScenes: []
    }
}

interface ParseTextValue {
    children: {
        NaturalLiteral: [IToken]
        StringLiteral: [IToken]
        Variable: [IToken]
    }
    name: 'value'
}

export interface ParseItem {
    children: {
        Button?: [IToken]
        Field?: [IToken]
        Image?: [IToken]
        Header?: [IToken]
        value?: [ParseTextValue]
    }
    name: 'item'
}

export interface ParseBlock {
    children: {
        Main?: [IToken],
        Block: [IToken]
        value: ParseTextValue[]
        item?: ParseItem[]
        list?: ParseList[]
    }
    name: 'block'
}

export interface ParseList {
    children: {
        List: [IToken]
        item?: ParseItem[]
    }
    name: 'list'
}

export interface ParsePage {
    children: {
        Page: [IToken],
        value: IToken[],
        block: ParseBlock[]
        list: ParseList[]
    }
    name: 'page'
}

export interface ParseValue {
    children: {
        page: ParsePage[]
    }
    name: 'scene'
}

interface ParseResult {
    value?: ParseValue;
    lexTokens?: IToken[];
    lexErrors?: ILexingError[];
    parseErrors?: IRecognitionException[];
}

let parserInstance: SceneParser
export function parseSceneToAST(sceneText: string): ParseResult {
    const lexResult = SceneLexer.tokenize(sceneText);
    if (lexResult.errors.length > 0) {
        return {
            lexErrors: lexResult.errors
        }
    }

    if (parserInstance === undefined) {
        parserInstance = new SceneParser() // {outputCst:false}
    }

    // setting a new input will RESET the parser instance's state.
    parserInstance.input = lexResult.tokens;

    // @ts-ignore
    const value = parserInstance.scene();

    if (parserInstance.errors.length > 0) {
        return {
            parseErrors: parserInstance.errors,
            lexTokens: lexResult.tokens,
        }
    }
    return {
        value: value, // this is a pure grammar, the value will always be <undefined>
        lexTokens: lexResult.tokens
    };
}
