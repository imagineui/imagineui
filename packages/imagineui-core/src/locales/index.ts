import ru_RU from './ru_RU'
import en_US from './en_US'
import {Dictionary, Locale} from './types';
export * from './types'

// TODO: Rework locale import/export to support Webpack tree-shaking
export const localeDictionaries: localeDictionaries = {
    [Locale.ru_RU]: ru_RU,
    [Locale.en_US]: en_US,
}

export const buildRegexFromWords = (words: string[], buildPatternFromWord: (word: string) => string) =>
    new RegExp(words.map(buildPatternFromWord).join('|'))

const testers = new Map(Object.values(Locale)
    .map(locale => localeDictionaries[locale])
    .map(dict => [dict.locale, buildRegexFromWords(dict.keywords.page, dict.buildPatternFromWord)]))

export const detectLocale = (sceneText: string): Locale | null => {
    const winning = [...testers]
        .map(([locale, tester]) => ({locale, score: tester.exec(sceneText)?.index}))
        .sort((a, b) =>
            (a.score ?? Infinity) - (b.score ?? Infinity))[0]

    if (winning.score !== undefined)
        return winning.locale

    return null;
}

type localeDictionaries = {
    [index in Locale]: Dictionary;
};
