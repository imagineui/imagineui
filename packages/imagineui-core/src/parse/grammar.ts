import * as chevrotain from 'chevrotain';
import {Rule} from "chevrotain";

const createToken = chevrotain.createToken;
const Lexer = chevrotain.Lexer;

const PAGE = /(\s+[Сс]траница:|[Сс]траница:|\s+[Ээ]кран:|[Ээ]кран:)/
const BLOCK = /(\s+[Бб]лок:|[Бб]лок:)/
const EXAMPLE = /(\s+[Пп]римеры:|[Пп]римеры:)/
const MAIN = /(\s+[Гг]лавный\s|[Гг]лавный\s)/
const HEADER = /(\s+[Зз]аголовок|[Зз]аголовок)/
const FIELD = /(\s+[Пп]оле ввода\s?|[Пп]оле ввода|\s+[Пп]оле|[Пп]оле)/
const BUTTON = /(\s+[Кк]нопка|[Кк]нопка|\s+[Сс]ылка|[Сс]ылка)/
const LIST = /(\s+[Сс]писок|[Сс]писок)/
const IMAGE = /(\s+[Кк]артинка|[Кк]артинка)/
const CONSISTS_OF = /(состоит из)/
const ALIGNED = /(расположены по)/
const WITH_ICON = /(с иконкой)/
//const KEYWORDS = /$${__PAGE} | $${__BLOCK} | $${__MAIN} | $${__HEADER} | $${__FIELD} | $${__BUTTON} | $${__LIST} | $${__IMAGE} | $${__CONSISTS_OF} | $${__ALIGNED} | $${__EXAMPLE} | $${__WITH_ICON}__VARIABLE \= (\$<.+>)/

const Page = createToken({name: "Page", pattern: PAGE});
const Block = createToken({name: "Block", pattern: BLOCK});
const Example = createToken({name: "Example", pattern: EXAMPLE});
const Main = createToken({name: "Main", pattern: MAIN});
const Field = createToken({name: "Field", pattern: FIELD});
const Button = createToken({name: "Button", pattern: BUTTON});
const Header = createToken({name: "Header", pattern: HEADER});
const List = createToken({name: "List", pattern: LIST});
const Image = createToken({name: "Image", pattern: IMAGE});
const Aligned = createToken({name: "Aligned", pattern: ALIGNED});
const WithIcon = createToken({name: "WithIcon", pattern: WITH_ICON});
const ConsistsOf = createToken({name: "ConsistsOf", pattern: CONSISTS_OF});
const Comma = createToken({name: "Comma", pattern: /,/});
const Colon = createToken({name: "Colon", pattern: /:/});

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
    Example, Main, Comma, Colon, Field, Button, Header, List, Image, Aligned, WithIcon, ConsistsOf, NaturalLiteral];

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

export class SceneParser extends Parser {
    readonly scene!: () => any;
    readonly page!: (idx: number) => any;
    readonly block!: (idx: number) => any;
    readonly example!: (idx: number) => any;
    readonly exampleitem!: (idx: number) => any;
    readonly item!: (idx: number) => any;
    readonly value!: (idx: number) => any;
    readonly list!: (idx: number) => any;
    readonly comment!: (idx: number) => any;

    constructor() {
        super(sceneTokens, {
            recoveryEnabled: true
        })

        const $ = this;

        $.RULE("scene", () => {
            $.OR([
                {ALT: () => $.SUBRULE($.page)},
                {ALT: () => $.SUBRULE($.comment)},
                {ALT: () => $.CONSUME(LineEnd)}
            ]);
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
            $.MANY(() => {
                $.OR([
                    {ALT: () => $.SUBRULE($.item)},
                    {ALT: () => $.SUBRULE($.list)}
                    ])
            });
        });

        $.RULE("item", () => {
            $.OPTION1(() => {
                $.OR([
                    {ALT: () => $.CONSUME(Field)},
                    {ALT: () => $.CONSUME(Button)},
                    {ALT: () => $.CONSUME(Header)},
                    {ALT: () => $.CONSUME(Image)}
                ]);
            })
            $.OPTION2(() => {
                $.SUBRULE($.value);
            })
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
                $.CONSUME(LineEnd);
            })
            // $.SUBRULE2($.value);
            $.CONSUME(ConsistsOf);
             // $.MANY_SEP({
             //   SEP: Comma, DEF: () => {
             //     $.SUBRULE($.value);
             //   }
             // });
            $.MANY(() => {
                $.SUBRULE2($.item);
            });
        });

        //$.RULE("array", () => {
        //  $.CONSUME(LSquare);
        //  $.MANY_SEP({
        //    SEP: Comma, DEF: () => {
        //      $.SUBRULE($.value);
        //    }
        //  });
        //  $.CONSUME(RSquare);
        //});

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
            $.CONSUME(LineEnd);
        })

        this.performSelfAnalysis();
    }

}
