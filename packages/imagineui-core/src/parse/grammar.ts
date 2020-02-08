import * as chevrotain from 'chevrotain';
import {buildTokensForLocale} from "./tokens";
import {TokenType} from "chevrotain";
const Lexer = chevrotain.Lexer;


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
    readonly blockalign!: (idx: number) => any;

    constructor(tokenSets: ReturnType<typeof buildTokensForLocale>, tokens: TokenType[]) {
        super(tokens, {
            recoveryEnabled: true
        })

        const {LineEnd, WhiteSpace, Comment, NumberLiteral, StringLiteral, Variable, NaturalLiteral,
            Comma,
            Colon} = tokenSets.CommonTokens;

        const {
            Page, Mobile, Tablet, Widescreen,
            Block, Blocks,
            Example, Main,
            Field, Button, Header, List, Image,
            Aligned, WithIcon, ConsistsOf,
            Rows, Columns,
        } = tokenSets.TokenSet;

        const {
            Zero, One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Eleven, Twelve,
        } = tokenSets.NumericTokenSet;

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
            $.OPTION(() => {
                $.OR1([
                    {ALT: () => $.CONSUME(Mobile)},
                    {ALT: () => $.CONSUME(Tablet)},
                    {ALT: () => $.CONSUME(Widescreen)}
                ]);
            });
            $.CONSUME(Page);
            // $.CONSUME(WhiteSpace);
            $.SUBRULE($.value);
            $.CONSUME1(LineEnd);
            $.MANY(() => {
                $.OR2([
                    {ALT: () => $.SUBRULE($.block)},
                    {ALT: () => $.SUBRULE($.example)},
                    {ALT: () => $.CONSUME2(LineEnd)},
                    {ALT: () => $.SUBRULE($.blockalign)}
                ]);
            })
        });

        $.RULE("block", () => {
            $.OPTION(() => {
                $.CONSUME(Main)
            });
            $.CONSUME(Block);
            $.SUBRULE($.value);
            $.CONSUME1(LineEnd);
            $.MANY1(() => {
                $.OR1([
                    {ALT: () => $.SUBRULE($.item)},
                    {ALT: () => $.SUBRULE($.list)},
                    {ALT: () => $.CONSUME2(LineEnd)}
                ])
            });
            $.MANY2(() => {
                $.OR2([
                    {ALT: () => $.SUBRULE($.rows)},
                    {ALT: () => $.SUBRULE($.columns)},
                    {ALT: () => $.CONSUME3(LineEnd)}
                    ])
            });
        });

        $.RULE("rows", () => {
            // $.CONSUME(In);
            $.OPTION(() => {
                $.SUBRULE($.number);
            });
            $.CONSUME(Rows);
            $.CONSUME1(LineEnd);
            $.MANY(() => {
                $.OR([
                    {ALT: () => $.SUBRULE($.item)},
                    {ALT: () => $.SUBRULE($.list)},
                    {ALT: () => $.CONSUME2(LineEnd)}
                ])
            });
        });

        $.RULE("columns", () => {
            // $.CONSUME(In);
            $.OPTION(() => {
                $.SUBRULE($.number);
            })
            $.CONSUME(Columns);
            $.CONSUME1(LineEnd);
            $.MANY(() => {
                $.OR([
                    {ALT: () => $.SUBRULE($.item)},
                    {ALT: () => $.SUBRULE($.list)},
                    {ALT: () => $.CONSUME2(LineEnd)}
                ])
            });
        });

        $.RULE("blockalign", () => {
            $.CONSUME(Blocks);
            $.MANY_SEP({
                SEP: Comma, DEF: () => {
                    $.SUBRULE($.value);
                }
            });
            $.CONSUME(Aligned);
            // $.CONSUME(In);
            $.OPTION(() => {
                $.SUBRULE($.number);
            });
            $.OR([
                {ALT: () => $.CONSUME(Rows)},
                {ALT: () => $.CONSUME(Columns)}
            ])
            $.CONSUME(LineEnd);
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
