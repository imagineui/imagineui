import {Dictionary, KeywordDictionary, Locale, NumericDictionary} from "../types";

const numbers: NumericDictionary = {
    zero: ['zero'],
    one: ['one'],
    two: ['two'],
    three: ['three'],
    four: ['four'],
    five: ['five'],
    six: ['six'],
    seven: ['seven'],
    eight: ['eight'],
    nine: ['nine'],
    ten: ['ten'],
    eleven: ['eleven'],
    twelve: ['twelve'],
}

const keywords: KeywordDictionary = {
    page: ['page:', 'screen:'],
    mobile: ['mobile'],
    tablet: ['tablet', 'laptop'],
    widescreen: ['widescreen', 'desktop'],
    with_scroll: ['with scroll'],

    block: ['block:'],
    blocks: ['blocks'],
    example: ['examples:'],
    main: ['main'],

    header: ['header'],
    field: ['input', 'field'],
    button: ['button', 'link to', 'link'],
    list: ['list'],
    image: ['image'],

    consists_of: ['consists of'],
    aligned: ['aligned in', 'aligned'],
    with_icon: ['with an icon'],
    rows: ['rows', 'row'],
    columns: ['columns', 'column'],
}
const buildPatternFromWord = (word: string) => {
    const caseInsensitive = `[${word[0].toUpperCase()}${word[0].toLowerCase()}]`
    const wordMatch = `${caseInsensitive}${word.substring(1)}`
    return `\s+${wordMatch}|${wordMatch}`
}

export default {
    locale: Locale.en_US,
    numbers, keywords, buildPatternFromWord
} as Dictionary
