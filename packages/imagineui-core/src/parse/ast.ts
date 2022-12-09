import {SceneParser} from './grammar';
import {ILexingError, IRecognitionException, IToken, Lexer, TokenType} from 'chevrotain';
import {detectLocale} from '../locales';
import {Locale} from '../locales/types';
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

export interface DirectionDescription {
    num: number,
    direction: 'column' | 'row',
    containerDirection: 'column' | 'row',
}

export const directionTokenFlatten = (token: [ParseDirection] | undefined): DirectionDescription => {
    if (!token) return {
        num: 1,
        direction: 'column',
        containerDirection: 'row',
    }

    const [{children}] = token;

    return {
        num: children.number ? numberTokenToNumber(children.number[0]) : 1,
        direction: children.Rows ? 'row' : 'column',
        containerDirection: children.Rows ? 'column' : 'row',
    }
}

export type AlignRule = DirectionDescription & {
    blocks: ParseBlock[],
}

export const blocksToRule = (token: ParseBlocks): AlignRule => ({
    blocks: token.children.block || [],
    ...directionTokenFlatten(token.children.blockalign?.[0].children.direction),
})

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
        size?: [ParseSize],
    }
    name: 'item'
}

export interface ParseSize {
    children: {
        FillingTheScreen?: [IToken],
    }
    name: 'size'
}

export interface ParseBlockAlign {
    children: {
        Blocks: [IToken],
        Aligned: [IToken],
        direction?: [ParseDirection],
    }
    name: 'blockalign'
}

export interface ParseBlocks {
    children: {
        blockalign?: [ParseBlockAlign],
        block: ParseBlock[],
    }
    name: 'blocks'
}

export interface ParseDirection {
    children: {
        number?: [IUINumber],
    } & ({
        Rows: [IToken],
        Columns?: never,
    } | {
        Rows?: never,
        Columns: [IToken],
    })
    name: 'direction'
}

export interface ParseElements {
    children: {
        direction?: [ParseDirection],
        item?: IUIItem[]
        list?: IUIList[],
    },
    name: 'elements'
}

export interface ParseBlock {
    children: {
        Block: [IToken]
        value?: [IUITextValue]
        elements?: [ParseElements],
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
        blocks: ParseBlocks[],
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
            ...restOfTokens
        } = tokenSets.TokenSet;

        const tokens = [LineEnd, WhiteSpace, Comment, NumberLiteral, StringLiteral, Variable,
            Page, Mobile, Tablet, Widescreen,
            Block, Blocks,
            Comma, Colon,
            ...Object.values(restOfTokens),
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
