import * as chevrotain from 'chevrotain';

import {KeywordDictionary, Locale, NumericDictionary} from "../locales/types";
import {buildRegexFromWords, localeDictionaries} from "../locales";
import {Lexer} from "chevrotain";

const createToken = chevrotain.createToken;

export const buildTokensForLocale = (locale: Locale) => {
    const {keywords, numbers, buildPatternFromWord} = localeDictionaries[locale]
    const toRegex = (strings: string[]) => buildRegexFromWords(strings, buildPatternFromWord)

    const buildTokenSet = (dict: KeywordDictionary) => ({
        Page: createToken({name: "Page", pattern: toRegex(dict.page)}),
        Mobile: createToken({name: "Mobile", pattern: toRegex(dict.mobile)}),
        Tablet: createToken({name: "Tablet", pattern: toRegex(dict.tablet)}),
        Widescreen: createToken({name: "Widescreen", pattern: toRegex(dict.widescreen)}),
        Block: createToken({name: "Block", pattern: toRegex(dict.block)}),
        Blocks: createToken({name: "Blocks", pattern: toRegex(dict.blocks)}),
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
    })

    const buildNumsSet = (dict: NumericDictionary) => ({
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
    })

    const CommonTokens = {
        Comment: createToken({
            name: 'Comment',
            pattern: /\/\/.*/,
            group: Lexer.SKIPPED
        }),
        StringLiteral: createToken({
            name: "StringLiteral", pattern: /"(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/
        }),
        Variable: createToken({
            name: "Variable", pattern: /<(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*>/
        }),
        NaturalLiteral: createToken({
            name: "NaturalLiteral", pattern: /([a-zA-Zа-яА-ЯёЁ ,./()'-])+/
        }),
        NumberLiteral: createToken({
            name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/
        }),
        LineEnd: createToken({
            name: "LineEnd",
            pattern: /[ ?]*\n/
        }),
        WhiteSpace: createToken({
            name: "WhiteSpace",
            pattern: /\s+/,
            group: Lexer.SKIPPED
        }),
        Comma: createToken({name: "Comma", pattern: /,/}),
        Colon: createToken({name: "Colon", pattern: /:/})
    }

    const TokenSet = buildTokenSet(keywords)
    const NumericTokenSet = buildNumsSet(numbers)

    return {
        TokenSet, NumericTokenSet, CommonTokens
    }
}
