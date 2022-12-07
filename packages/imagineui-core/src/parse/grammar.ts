import * as chevrotain from 'chevrotain';
import {buildTokensForLocale} from './tokens';
import {TokenType} from 'chevrotain';
const Lexer = chevrotain.Lexer;

// ----------------- parser -----------------
const Parser = chevrotain.Parser;

// TODO: [conformity] Test if the parsed AST conforms to the TypeScript types or generate TS types from the rules
export class SceneParser extends Parser {
    private readonly scene!: () => any;
    private readonly page!: (idx: number) => any;
    private readonly block!: (idx: number) => any;
    private readonly row!: (idx: number) => any;
    private readonly column!: (idx: number) => any;
    private readonly rows!: (idx: number) => any;
    private readonly columns!: (idx: number) => any;
    private readonly example!: (idx: number) => any;
    private readonly exampleitem!: (idx: number) => any;
    private readonly item!: (idx: number) => any;
    private readonly value!: (idx: number) => any;
    private readonly list!: (idx: number) => any;
    private readonly comment!: (idx: number) => any;
    private readonly literal!: (idx: number) => any;
    private readonly number!: (idx: number) => any;
    private readonly blockalign!: (idx: number) => any;

    constructor(tokenSets: ReturnType<typeof buildTokensForLocale>, tokens: TokenType[]) {
        super(tokens, {
            recoveryEnabled: true,
        })

        const {LineEnd, WhiteSpace, Comment, NumberLiteral, StringLiteral, Variable, NaturalLiteral,
            Comma,
            Colon} = tokenSets.CommonTokens;

        const {
            Page, Mobile, Tablet, Widescreen,
            Block, Blocks,
            Example,
            Field, Button, Header, List, Image, Space,
            Aligned, WithIcon, ConsistsOf,
            Top, Bottom, Left, Right, Center,
            Rows, Columns,
        } = tokenSets.TokenSet;

        const {
            Zero, One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten, Eleven, Twelve,
        } = tokenSets.NumericTokenSet;

        const $ = this as SceneParser;

        $.RULE('scene', () => {
            $.MANY(() => {
                $.OR([
                    {ALT: () => $.SUBRULE($.page)},
                    {ALT: () => $.SUBRULE($.comment)},
                    {ALT: () => $.CONSUME(LineEnd)},
                ]);
            });
        });

        $.RULE('page', () => {
            $.OPTION(() => {
                $.OR1([
                    {ALT: () => $.CONSUME(Mobile)},
                    {ALT: () => $.CONSUME(Tablet)},
                    {ALT: () => $.CONSUME(Widescreen)},
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
                    {ALT: () => $.SUBRULE($.blockalign)},
                ]);
            })
        });

        // Top, Bottom, Left, Right, Center
        $.RULE('block', () => {
            $.OPTION(() => {
                $.OR1([
                    {ALT: () => $.CONSUME2(Top)},
                    {ALT: () => $.CONSUME2(Bottom)},
                    {ALT: () => $.CONSUME2(Left)},
                    {ALT: () => $.CONSUME2(Right)},
                    {ALT: () => $.CONSUME2(Center)},
                ])
            });
            $.CONSUME(Block);
            $.SUBRULE($.value);
            $.CONSUME1(LineEnd);
            $.MANY1(() => {
                $.OR2([
                    {ALT: () => $.SUBRULE($.item)},
                    {ALT: () => $.SUBRULE($.list)},
                    {ALT: () => $.CONSUME2(LineEnd)},
                ])
            });
            $.MANY2(() => {
                $.OR3([
                    {ALT: () => $.SUBRULE($.rows)},
                    {ALT: () => $.SUBRULE($.columns)},
                    {ALT: () => $.CONSUME3(LineEnd)},
                    ])
            });
        });

        $.RULE('rows', () => {
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
                    {ALT: () => $.CONSUME2(LineEnd)},
                ])
            });
        });

        $.RULE('columns', () => {
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
                    {ALT: () => $.CONSUME2(LineEnd)},
                ])
            });
        });

        $.RULE('blockalign', () => {
            $.CONSUME(Blocks);
            $.MANY_SEP({
                SEP: Comma, DEF: () => {
                    $.SUBRULE($.value);
                },
            });
            $.CONSUME(Aligned);
            // $.CONSUME(In);
            $.OPTION(() => {
                $.SUBRULE($.number);
            });
            $.OR([
                {ALT: () => $.CONSUME(Rows)},
                {ALT: () => $.CONSUME(Columns)},
            ])
            $.CONSUME(LineEnd);
        });

        $.RULE('item', () => {
            $.OR1([
                {ALT: () => {
                    $.OR2([
                            {ALT: () => $.CONSUME(Field)},
                            {ALT: () => $.CONSUME(Button)},
                            {ALT: () => $.CONSUME(Header)},
                            {ALT: () => $.CONSUME(Image)},
                            {ALT: () => $.CONSUME(Space)},
                        ]);
                    $.OPTION(() => $.SUBRULE($.value))
                    }},
                {ALT: () => $.SUBRULE($.literal)},
            ]);
            $.CONSUME(LineEnd);
        });

        $.RULE('example', () => {
            $.CONSUME(Example);
            $.CONSUME(LineEnd);
            $.MANY(() => {
                $.SUBRULE($.exampleitem);
            });
        });

        $.RULE('exampleitem', () => {
            $.OR([
                {ALT: () => $.CONSUME(Field)},
                {ALT: () => $.CONSUME(Button)},
                {ALT: () => $.CONSUME(Header)},
                {ALT: () => $.CONSUME(Image)},
                {ALT: () => $.CONSUME(Space)},
                {ALT: () => $.CONSUME(Variable)},
            ]);
            $.CONSUME(Colon);
            $.MANY_SEP({
              SEP: Comma, DEF: () => {
                $.SUBRULE($.value);
              },
            });
            $.CONSUME(LineEnd);
        });

        $.RULE('list', () => {
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

        $.RULE('literal', () => {
            $.OR([
                {ALT: () => $.CONSUME(StringLiteral)},
                {ALT: () => $.CONSUME(Variable)},
            ]);
        });

        $.RULE('number', () => {
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

        $.RULE('value', () => {
            $.OR([
                {ALT: () => $.CONSUME(StringLiteral)},
                // {ALT: () => $.CONSUME(NumberLiteral)},
                {ALT: () => $.CONSUME(Variable)},
                {ALT: () => $.CONSUME(NaturalLiteral)},
            ]);
        });

        $.RULE('comment', () => {
            $.CONSUME(Comment);
            $.OPTION(() => $.CONSUME(LineEnd))
        })

        this.performSelfAnalysis();
    }

}
