import {SceneParser} from "./grammar";
import {ILexingError, IRecognitionException, IToken, Lexer, TokenType} from "chevrotain";
import {detectLocale} from "../locales";
import {Dictionary, Locale} from "../locales/types";
import {buildTokensForLocale} from "./tokens";

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

export interface ParseTextValue {
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

export interface ParseBlockAlign {
    children: {
        Blocks: [IToken]
        value: ParseTextValue[]
        Aligned: [IToken]
        number?: [ParseNumber]
        Rows?: [IToken]
        Columns?: [IToken]
    }
    name: 'blockalign'
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
        Mobile?: [IToken],
        Tablet?: [IToken],
        Widescreen?: [IToken],
        Page: [IToken],
        value: IToken[],
        block?: ParseBlock[],
        blockalign?: ParseBlockAlign[],
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

export interface ParseResult {
    value?: ParseValue;
    lexTokens?: IToken[];
    lexErrors?: ILexingError[];
    parseErrors?: IRecognitionException[];
}

type localeParsersStorage = {
    [index in Locale]?: {
        tokenSets: ReturnType<typeof buildTokensForLocale>
        tokens: TokenType[]
        lexer: Lexer
        parser: SceneParser
    }
}

const localeParsers: localeParsersStorage = {}

export function parseSceneToAST(sceneText: string): ParseResult {
    const locale = detectLocale(sceneText)
    if(!locale) {
        return {
            lexErrors: [{
                line: 0,
                column: 0,
                offset: 0,
                length: 10,
                message: 'No locale detected. Please use one of the locale-specific keywords for .scene ("экран:", "screen:", etc.)'
            }]
        }
    }

    let storage = localeParsers[locale]

    if (storage === undefined) {

        const tokenSets = buildTokensForLocale(locale)

        const {LineEnd, WhiteSpace, Comment, NumberLiteral, StringLiteral, Variable, NaturalLiteral,
            Comma,
            Colon} = tokenSets.CommonTokens;

        // TODO: [locales] Localize token names and error messages
        Comma.LABEL = "','";
        Colon.LABEL = "':'";

        const {
            Page, Mobile, Tablet, Widescreen,
            Block, Blocks,
            Example, Main,
            Field, Button, Header, List, Image,
            Aligned, WithIcon, ConsistsOf,
            Rows, Columns,
        } = tokenSets.TokenSet;

        const tokens = [LineEnd, WhiteSpace, Comment, NumberLiteral, StringLiteral, Variable,
            Page, Mobile, Tablet, Widescreen,
            Block, Blocks,
            Example, Main, Comma, Colon, Field, Button, Header, List, Image, Aligned, Rows, Columns, WithIcon, ConsistsOf,
            ...Object.values(tokenSets.NumericTokenSet),
            NaturalLiteral];

        storage = {
            tokenSets,
            tokens,
            lexer: new Lexer(tokens, {
                // Less position info tracked, reduces verbosity of the playground output.
                positionTracking: "onlyStart", safeMode: true
                // positionTracking: "onlyStart", skipValidations: true, ensureOptimizations: true TODO: enable optimizations
            }),
            parser: new SceneParser(tokenSets, tokens) // {outputCst:false}
        }

        localeParsers[locale] = storage;
    }

    const {parser, lexer} = storage!;

    const lexResult = lexer.tokenize(sceneText);
    if (lexResult.errors.length > 0) {
        return {
            lexErrors: lexResult.errors
        }
    }

    // setting a new input will RESET the parser instance's state.
    parser.input = lexResult.tokens;

    // @ts-ignore
    const value = parser.scene();

    if (parser.errors.length > 0) {
        return {
            parseErrors: parser.errors,
            lexTokens: lexResult.tokens,
        }
    }
    return {
        value: value, // this is a pure grammar, the value will always be <undefined>
        lexTokens: lexResult.tokens
    };
}
