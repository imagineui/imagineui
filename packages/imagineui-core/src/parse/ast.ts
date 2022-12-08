import {SceneParser} from './grammar';
import {ILexingError, IRecognitionException, IToken, Lexer, TokenType} from 'chevrotain';
import {detectLocale} from '../locales';
import {Dictionary, Locale} from '../locales/types';
import {buildTokensForLocale} from './tokens';

interface IUIText {
    children: {
        StringLiteral: [IToken]
        Variable: [IToken],
    }
    name: 'text'
}

interface IUINumber {
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
        Twelve?: [IToken],
    }
    name: 'number'
}

export const numberTokenToNumber = ({children}: IUINumber) => {
    if (children.NumberLiteral) {
        return parseFloat(children.NumberLiteral[0].image)
    }

    if (children.Zero) return 0;
    if (children.One) return 1;
    if (children.Two) return 2;
    if (children.Three) return 3;
    if (children.Four) return 4;
    if (children.Five) return 5;
    if (children.Six) return 6;
    if (children.Seven) return 7;
    if (children.Eight) return 8;
    if (children.Nine) return 9;
    if (children.Ten) return 10;
    if (children.Eleven) return 11;
    if (children.Twelve) return 12;

    throw new Error('Parsed number has no tokens')
}

export interface IUITextValue {
    children: {
        NaturalLiteral: [IToken]
        StringLiteral: [IToken]
        Variable: [IToken],
    }
    name: 'value'
}

export interface IUIItem {
    children: {
        Button?: [IToken]
        Field?: [IToken]
        Image?: [IToken]
        Space?: [IToken]
        Header?: [IToken]
        value?: [IUITextValue]
        literal?: [IUIText],
    }
    name: 'item'
}

export interface ParseBlockAlign {
    children: {
        Blocks: [IToken]
        value: IUITextValue[]
        Aligned: [IToken]
        number?: [IUINumber]
        Rows?: [IToken]
        Columns?: [IToken],
    }
    name: 'blockalign'
}

export interface ParseDirection {
    children: {
        In: [IToken]
        number?: [IUINumber]
        item?: IUIItem[]
        list?: IUIList[],
    } & ({
        Rows: [IToken],
        Columns?: never,
    } | {
        Rows?: never,
        Columns: [IToken],
    })
    name: 'direction'
}

export interface ParseBlock {
    children: {
        Top?: [IToken],
        Bottom?: [IToken],
        Left?: [IToken],
        Right?: [IToken],
        Center?: [IToken],
        Block: [IToken]
        value: IUITextValue[]
        item?: IUIItem[]
        list?: IUIList[]
        direction?: ParseDirection[],
    }
    name: 'block'
}

export interface IUIList {
    children: {
        List: [IToken]
        item?: IUIItem[],
    }
    name: 'list'
}

export interface IUIPage {
    children: {
        Mobile?: [IToken],
        Tablet?: [IToken],
        Widescreen?: [IToken],
        Page: [IToken],
        value: IToken[],
        block?: ParseBlock[],
        blockalign?: ParseBlockAlign[],
        list: IUIList[],
    }
    name: 'page'
}

export interface IUIScene {
    children: {
        page: IUIPage[],
    }
    name: 'scene'
}

export interface IUIParseResult {
    value?: IUIScene;
    lexTokens?: IToken[];
    lexErrors?: ILexingError[];
    parseErrors?: IRecognitionException[];
}

type localeParsersStorage = {
    [index in Locale]?: {
        tokenSets: ReturnType<typeof buildTokensForLocale>
        tokens: TokenType[]
        lexer: Lexer
        parser: SceneParser,
    }
}

const localeParsers: localeParsersStorage = {}

export function parseSceneToAST(sceneText: string): IUIParseResult {
    const locale = detectLocale(sceneText)
    if (!locale) {
        return {
            lexErrors: [{
                line: 0,
                column: 0,
                offset: 0,
                length: 10,
                message: 'No locale detected. Please use one of the locale-specific keywords for .scene ("экран:", "screen:", etc.)',
            }],
        }
    }

    let storage = localeParsers[locale]

    if (storage === undefined) {

        const tokenSets = buildTokensForLocale(locale)

        const {LineEnd, WhiteSpace, Comment, NumberLiteral, StringLiteral, Variable, NaturalLiteral,
            Comma,
            Colon} = tokenSets.CommonTokens;

        // TODO: [locales] Localize token names and error messages
        Comma.LABEL = '\',\'';
        Colon.LABEL = '\':\'';

        const {
            Page, Mobile, Tablet, Widescreen,
            Block, Blocks,
            Field, Button, Header, List, Image, Space,
            Aligned, WithIcon, ConsistsOf,
            Rows, Columns,
            Top, Bottom, Left, Right, Center,
        } = tokenSets.TokenSet;

        const tokens = [LineEnd, WhiteSpace, Comment, NumberLiteral, StringLiteral, Variable,
            Page, Mobile, Tablet, Widescreen,
            Block, Blocks,
            Comma, Colon, Field, Button, Header, List, Image, Space,
            Aligned, Rows, Columns, WithIcon, ConsistsOf,
            Top, Bottom, Left, Right, Center,
            ...Object.values(tokenSets.NumericTokenSet),
            NaturalLiteral];

        storage = {
            tokenSets,
            tokens,
            lexer: new Lexer(tokens, {
                // Less position info tracked, reduces verbosity of the playground output.
                positionTracking: 'onlyStart', safeMode: true,
                // positionTracking: "onlyStart", skipValidations: true, ensureOptimizations: true
                // TODO: enable optimizations
            }),
            parser: new SceneParser(tokenSets, tokens), // {outputCst:false}
        }

        localeParsers[locale] = storage;
    }

    const {parser, lexer} = storage!;

    const lexResult = lexer.tokenize(sceneText);
    if (lexResult.errors.length > 0) {
        return {
            lexErrors: lexResult.errors,
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
        value, // this is a pure grammar, the value will always be <undefined>
        lexTokens: lexResult.tokens,
    };
}
