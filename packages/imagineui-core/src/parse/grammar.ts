import * as chevrotain from 'chevrotain';
import {Rule} from "chevrotain";

const createToken = chevrotain.createToken;
const Lexer = chevrotain.Lexer;

/**
 * Natural language numerics are limited to a 12-column system
 * TODO: Consider parsing all numerals
 */
interface NumericDictionary {
    zero: string[];
    one: string[];
    two: string[];
    three: string[];
    four: string[];
    five: string[];
    six: string[];
    seven: string[];
    eight: string[];
    nine: string[];
    ten: string[];
    eleven: string[];
    twelve: string[];
}

interface KeywordDictionary {
    page: string[];
    block: string[];
    example: string[];
    main: string[];

    header: string[];
    field: string[];
    button: string[];
    list: string[];
    image: string[];

    consists_of: string[];
    with_icon: string[];

    aligned: string[];
    // in: string[];
    rows: string[];
    columns: string[];
}

const ru_RUNumbers: NumericDictionary = {
    zero: ['ноль','ноля','нолю'],
    one: ['один', 'одна', 'одного', 'одну', 'одним', 'одной'],
    two: ['два', 'две', 'двум','двумя'],
    three: ['три','трём','тремя'],
    four: ['четыре', 'четырём','четыремя'],
    five: ['пять', 'пяти', 'пятью'],
    six: ['шесть', 'шести','шестью'],
    seven: ['семь', 'семи','семью'],
    eight: ['восемь', 'восьми', 'восьмью'],
    nine: ['девять', 'девяти', 'девятью'],
    ten: ['десять', 'десяти', 'десятью'],
    eleven: ['одиннадцать', 'одиннадцати', 'одиннадцатью'],
    twelve: ['двенадцать', 'двенадцати', 'двенадцатью'],
}
// TODO: [perf] Pre-bake patterns with all necessary inflections with a compile-time script
const ru_RUKeywords: KeywordDictionary = {
    page: ['страница:', 'экран:'],
    block: ['блок:'],
    example: ['примеры:'],
    main: ['главный'],

    header: ['заголовок'],
    field: ['поле ввода','поле'],
    button: ['кнопка','ссылка'],
    list: ['список'],
    image: ['картинка'],

    consists_of: ['включает в себя'],
    aligned: ['расположены'],
    // in: ['в'],
    with_icon: ['с иконкой'],
    rows: ['строка', 'строку', 'строчка', 'строчку', 'строки', 'строк', 'строкой', 'строчкой', 'строками', 'строчками'],
    columns: ['столбец', 'столбца', 'столбцов', 'столбцом'], // TODO: [lint] Auto-correction for plural inflections
}

const buildPatternFromWord = (word: string) => {
    const caseInsensitive = `[${word[0].toUpperCase()}${word[0].toLowerCase()}]`
    const wordMatch = `${caseInsensitive}${word.substring(1).replace('ё', '[её]')}`
    return `\s+${wordMatch}|${wordMatch}`
}

const buildRegexFromWords = (words: string[]) =>
    new RegExp(words.map(buildPatternFromWord).join('|'))

const buildTokenSet = (dict: KeywordDictionary) => {
    const toRegex = buildRegexFromWords

    return {
        Page: createToken({name: "Page", pattern: toRegex(dict.page)}),
        Block: createToken({name: "Block", pattern: toRegex(dict.block)}),
        Example: createToken({name: "Example", pattern: toRegex(dict.example)}),
        Main: createToken({name: "Main", pattern: toRegex(dict.main)}),
        Field: createToken({name: "Field", pattern: toRegex(dict.field)}),
        Button: createToken({name: "Button", pattern: toRegex(dict.button)}),
        Header: createToken({name: "Header", pattern: toRegex(dict.header)}),
        List: createToken({name: "List", pattern: toRegex(dict.list)}),
        Image: createToken({name: "Image", pattern: toRegex(dict.image)}),
        WithIcon: createToken({name: "WithIcon", pattern: toRegex(dict.with_icon)}),
        ConsistsOf: createToken({name: "ConsistsOf", pattern: toRegex(dict.consists_of)}),
        Aligned: createToken({name: "Aligned", pattern: toRegex(dict.aligned)}),
        // In: createToken({name: "In", pattern: toRegex(dict.in)}),
        Rows: createToken({name: "Rows", pattern: toRegex(dict.rows)}),
        Columns: createToken({name: "Columns", pattern: toRegex(dict.columns)}),
        Comma: createToken({name: "Comma", pattern: /,/}),
        Colon: createToken({name: "Colon", pattern: /:/}),
    }
}

const buildNumsSet = (dict: NumericDictionary) => {
    const toRegex = buildRegexFromWords

    return {
        Zero: createToken({name: "Zero", pattern: toRegex(dict.zero)}),
        One: createToken({name: "One", pattern: toRegex(dict.one)}),
        Two: createToken({name: "Two", pattern: toRegex(dict.two)}),
        Three: createToken({name: "Three", pattern: toRegex(dict.three)}),
        Four: createToken({name: "Four", pattern: toRegex(dict.four)}),
        Five: createToken({name: "Five", pattern: toRegex(dict.five)}),
        Six: createToken({name: "Six", pattern: toRegex(dict.six)}),
        Seven: createToken({name: "Seven", pattern: toRegex(dict.seven)}),
        Eight: createToken({name: "Eight", pattern: toRegex(dict.eight)}),
        Nine: createToken({name: "Nine", pattern: toRegex(dict.nine)}),
        Ten: createToken({name: "Ten", pattern: toRegex(dict.ten)}),
        Eleven: createToken({name: "Eleven", pattern: toRegex(dict.eleven)}),
        Twelve: createToken({name: "Twelve", pattern: toRegex(dict.twelve)}),
    }
}

const CONSISTS_OF = /(включает в себя)/
const ALIGNED = /(расположены по)/
const WITH_ICON = /(с иконкой)/

const TokenSet = buildTokenSet(ru_RUKeywords)
const NumericTokenSet = buildNumsSet(ru_RUNumbers)

const {
    Page,
    Block,
    Example,
    Main,
    Field,
    Button,
    Header,
    List,
    Image,
    Aligned,
    WithIcon,
    ConsistsOf,
    // In,
    Rows,
    Columns,
    Comma,
    Colon
} = TokenSet;

const {
    Zero,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Eleven,
    Twelve,
} = NumericTokenSet;

export const KEYWORDS_PATTERN = Object.values(ru_RUKeywords).map(buildRegexFromWords).map(regex => regex.source).join('|')

const Comment = createToken({
    name: 'Comment',
    pattern: /\/\/.*/,
    group: Lexer.SKIPPED
});

const StringLiteral = createToken({
    name: "StringLiteral", pattern: /"(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/
});
const Variable = createToken({
    name: "Variable", pattern: /<(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*>/
});

const NaturalLiteral = createToken({
    name: "NaturalLiteral", pattern: /([a-zA-Zа-яА-Я ,./()'-])+/
});


const NumberLiteral = createToken({
    name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
});
const LineEnd = createToken({
    name: "LineEnd",
    pattern: /\n+/
});
const WhiteSpace = createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

const sceneTokens = [LineEnd, WhiteSpace, Comment, NumberLiteral, StringLiteral, Variable, Page, Block,
    Example, Main, Comma, Colon, Field, Button, Header, List, Image, Aligned, Rows, Columns, WithIcon, ConsistsOf,
    ...Object.values(NumericTokenSet),
    NaturalLiteral];

export const SceneLexer = new Lexer(sceneTokens, {
    // Less position info tracked, reduces verbosity of the playground output.
    positionTracking: "onlyStart", safeMode: true,
});

// Labels only affect error messages and Diagrams.
// LCurly.LABEL = "'{'";
// RCurly.LABEL = "'}'";
// LSquare.LABEL = "'['";
// RSquare.LABEL = "']'";
Comma.LABEL = "','";
Colon.LABEL = "':'";


// ----------------- parser -----------------
const Parser = chevrotain.Parser;

// TODO: [conformity] Test if the parsed AST conforms to the TypeScript types or generate TS types from the rules
export class SceneParser extends Parser {
    readonly scene!: () => any;
    readonly page!: (idx: number) => any;
    readonly block!: (idx: number) => any;
    readonly row!: (idx: number) => any;
    readonly column!: (idx: number) => any;
    readonly rows!: (idx: number) => any;
    readonly columns!: (idx: number) => any;
    readonly example!: (idx: number) => any;
    readonly exampleitem!: (idx: number) => any;
    readonly item!: (idx: number) => any;
    readonly value!: (idx: number) => any;
    readonly list!: (idx: number) => any;
    readonly comment!: (idx: number) => any;
    readonly literal!: (idx: number) => any;
    readonly number!: (idx: number) => any;

    constructor() {
        super(sceneTokens, {
            recoveryEnabled: true
        })

        const $ = this;

        $.RULE("scene", () => {
            $.MANY(() => {
                $.OR([
                    {ALT: () => $.SUBRULE($.page)},
                    {ALT: () => $.SUBRULE($.comment)},
                    {ALT: () => $.CONSUME(LineEnd)}
                ]);
            });
        });

        $.RULE("page", () => {
            $.CONSUME(Page);
            // $.CONSUME(WhiteSpace);
            $.SUBRULE($.value);
            $.CONSUME(LineEnd);
            $.MANY(() => {
                $.OR([
                    {ALT: () => $.SUBRULE($.block)},
                    {ALT: () => $.SUBRULE($.example)}
                ]);
            })
        });

        $.RULE("block", () => {
            $.OPTION(() => {
                $.CONSUME(Main)
            });
            $.CONSUME(Block);
            $.SUBRULE($.value);
            $.CONSUME(LineEnd);
            $.MANY1(() => {
                $.OR1([
                    {ALT: () => $.SUBRULE($.item)},
                    {ALT: () => $.SUBRULE($.list)}
                ])
            });
            $.MANY2(() => {
                $.OR2([
                    {ALT: () => $.SUBRULE($.rows)},
                    {ALT: () => $.SUBRULE($.columns)},
                    ])
            });
        });

        $.RULE("rows", () => {
            // $.CONSUME(In);
            $.OPTION(() => {
                $.SUBRULE($.number);
            });
            $.CONSUME(Rows);
            $.CONSUME(LineEnd);
            $.MANY(() => {
                $.OR([
                    {ALT: () => $.SUBRULE($.item)},
                    {ALT: () => $.SUBRULE($.list)}
                ])
            });
        });

        $.RULE("columns", () => {
            // $.CONSUME(In);
            $.OPTION(() => {
                $.SUBRULE($.number);
            })
            $.CONSUME(Columns);
            $.CONSUME(LineEnd);
            $.MANY(() => {
                $.OR([
                    {ALT: () => $.SUBRULE($.item)},
                    {ALT: () => $.SUBRULE($.list)}
                ])
            });
        });

        $.RULE("item", () => {
            $.OR1([
                {ALT: () => {
                    $.OR2([
                            {ALT: () => $.CONSUME(Field)},
                            {ALT: () => $.CONSUME(Button)},
                            {ALT: () => $.CONSUME(Header)},
                            {ALT: () => $.CONSUME(Image)}
                        ]);
                    $.OPTION(() => $.SUBRULE($.value))
                    }},
                {ALT: () => $.SUBRULE($.literal)},
            ]);
            $.CONSUME(LineEnd);
        });

        $.RULE("example", () => {
            $.CONSUME(Example);
            $.CONSUME(LineEnd);
            $.MANY(() => {
                $.SUBRULE($.exampleitem);
            });
        });

        $.RULE("exampleitem", () => {
            $.OR([
                {ALT: () => $.CONSUME(Field)},
                {ALT: () => $.CONSUME(Button)},
                {ALT: () => $.CONSUME(Header)},
                {ALT: () => $.CONSUME(Image)},
                {ALT: () => $.CONSUME(Variable)},
            ]);
            $.CONSUME(Colon);
            $.MANY_SEP({
              SEP: Comma, DEF: () => {
                $.SUBRULE($.value);
              }
            });
            $.CONSUME(LineEnd);
        });

        $.RULE("list", () => {
            $.CONSUME(List);
            $.OPTION2(() => {
                $.SUBRULE1($.value);
                $.CONSUME1(LineEnd);
            })
            $.CONSUME(ConsistsOf);
            $.CONSUME2(LineEnd);
            $.MANY(() => {
                $.SUBRULE2($.item);
            });
        });

        $.RULE("literal", () => {
            $.OR([
                {ALT: () => $.CONSUME(StringLiteral)},
                {ALT: () => $.CONSUME(Variable)},
            ]);
        });

        $.RULE("number", () => {
            $.OR([
                {ALT: () => $.CONSUME(NumberLiteral)},
                {ALT: () => $.CONSUME(Zero)},
                {ALT: () => $.CONSUME(One)},
                {ALT: () => $.CONSUME(Two)},
                {ALT: () => $.CONSUME(Three)},
                {ALT: () => $.CONSUME(Four)},
                {ALT: () => $.CONSUME(Five)},
                {ALT: () => $.CONSUME(Six)},
                {ALT: () => $.CONSUME(Seven)},
                {ALT: () => $.CONSUME(Eight)},
                {ALT: () => $.CONSUME(Nine)},
                {ALT: () => $.CONSUME(Ten)},
                {ALT: () => $.CONSUME(Eleven)},
                {ALT: () => $.CONSUME(Twelve)},
            ]);
        })

        $.RULE("value", () => {
            $.OR([
                {ALT: () => $.CONSUME(StringLiteral)},
                //{ALT: () => $.CONSUME(NumberLiteral)},
                {ALT: () => $.CONSUME(Variable)},
                {ALT: () => $.CONSUME(NaturalLiteral)},
            ]);
        });

        $.RULE("comment", () => {
            $.CONSUME(Comment);
            $.OPTION(() => $.CONSUME(LineEnd))
        })

        this.performSelfAnalysis();
    }

}
