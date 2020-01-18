import {SceneLexer, SceneParser} from "./grammar";
import {ILexingError, IRecognitionException, IToken} from "chevrotain";

interface ParseText {
    children: {
        StringLiteral: [IToken]
        Variable: [IToken]
    }
    name: 'text'
}

interface ParseNumber {
    children: {
        NumberLiteral?: [IToken]
        Zero?: [IToken]
        One?: [IToken]
        Two?: [IToken]
        Three?: [IToken]
        Four?: [IToken]
        Five?: [IToken]
        Six?: [IToken]
        Seven?: [IToken]
        Eight?: [IToken]
        Nine?: [IToken]
        Ten?: [IToken]
        Eleven?: [IToken]
        Twelve?: [IToken]
    }
    name: 'number'
}

export const numberTokenToNumber = ({children}: ParseNumber) => {
    if(children.NumberLiteral) {
        return parseFloat(children.NumberLiteral[0].image)
    }

    if(children.Zero) return 0;
    if(children.One) return 1;
    if(children.Two) return 2;
    if(children.Three) return 3;
    if(children.Four) return 4;
    if(children.Five) return 5;
    if(children.Six) return 6;
    if(children.Seven) return 7;
    if(children.Eight) return 8;
    if(children.Nine) return 9;
    if(children.Ten) return 10;
    if(children.Eleven) return 11;
    if(children.Twelve) return 12;

    throw new Error('Parsed number has no tokens')
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
        literal? : [ParseText]
    }
    name: 'item'
}

export interface ParseColumns {
    children: {
        In: [IToken]
        number?: [ParseNumber]
        Columns: [IToken]
        item?: ParseItem[]
        list?: ParseList[]
    }
    name: 'columns'
}

export interface ParseRows {
    children: {
        In: [IToken]
        number?: [ParseNumber]
        Rows: [IToken]
        item?: ParseItem[]
        list?: ParseList[]
    }
    name: 'rows'
}

export interface ParseBlock {
    children: {
        Main?: [IToken],
        Block: [IToken]
        value: ParseTextValue[]
        item?: ParseItem[]
        list?: ParseList[]
        rows?: ParseRows[]
        columns?: ParseColumns[]
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
        block?: ParseBlock[]
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
