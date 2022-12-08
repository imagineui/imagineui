import * as chevrotain from 'chevrotain';

import {KeywordDictionary, Locale, NumericDictionary, buildRegexFromWords, localeDictionaries} from '../locales';
import {Lexer} from 'chevrotain';
import mapValues from 'lodash.mapvalues';

const createToken = chevrotain.createToken;

export const buildTokensForLocale = (locale: Locale) => {
    const {keywords, numbers, buildPatternFromWord} = localeDictionaries[locale]
    const toRegex = (strings: string[]) => buildRegexFromWords(strings, buildPatternFromWord)
    const createTokensFromDicts = <T extends string | number | symbol>(dict: Record<T, string[]>) =>
      mapValues(dict, (tokens, name) => createToken({name, pattern: toRegex(tokens)}))

    const CommonTokens = {
        Comment: createToken({
            name: 'Comment',
            pattern: /\/\/.*/,
            group: Lexer.SKIPPED,
        }),
        StringLiteral: createToken({
            name: 'StringLiteral', pattern: /["«»](?:[^\n\r"\\]|\\.)*["«»]/,
        }),
        Variable: createToken({
            name: 'Variable', pattern: /<(?:[^\n\r"\\]|\\.)*>/,
        }),
        NaturalLiteral: createToken({
            name: 'NaturalLiteral', pattern: /([a-zA-Zа-яА-ЯёЁ ,./()'-])+/,
        }),
        NumberLiteral: createToken({
            name: 'NumberLiteral', pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/,
        }),
        LineEnd: createToken({
            name: 'LineEnd',
            pattern: /[ ?]*\n/,
        }),
        WhiteSpace: createToken({
            name: 'WhiteSpace',
            pattern: /\s+/,
            group: Lexer.SKIPPED,
        }),
        Comma: createToken({name: 'Comma', pattern: /,/}),
        Colon: createToken({name: 'Colon', pattern: /:/}),
    }

    const TokenSet = createTokensFromDicts(keywords)
    const NumericTokenSet = createTokensFromDicts(numbers)

    return {
        TokenSet, NumericTokenSet, CommonTokens,
    }
}
