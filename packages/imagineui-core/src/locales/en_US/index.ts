import {Dictionary, KeywordDictionary, Locale, NumericDictionary} from '../types';

const numbers: NumericDictionary = {
    Zero: ['zero'],
    One: ['one'],
    Two: ['two'],
    Three: ['three'],
    Four: ['four'],
    Five: ['five'],
    Six: ['six'],
    Seven: ['seven'],
    Eight: ['eight'],
    Nine: ['nine'],
    Ten: ['ten'],
    Eleven: ['eleven'],
    Twelve: ['twelve'],
}

const keywords: KeywordDictionary = {
    Page: ['page:', 'screen:'],
    Mobile: ['mobile'],
    Tablet: ['tablet', 'laptop'],
    Widescreen: ['widescreen', 'desktop'],

    Block: ['block:'],
    Blocks: ['blocks'],

    Header: ['header'],
    Field: ['input', 'field'],
    Button: ['button', 'link to', 'link'],
    List: ['list'],
    Image: ['image'],
    Space: ['space', 'empty space'],

    ConsistsOf: ['consists of'],
    Aligned: ['aligned in', 'aligned'],
    WithIcon: ['with an icon'],
    Rows: ['rows', 'row'],
    Columns: ['columns', 'column'],

    Top: ['top', 'above'],
    Bottom: ['bottom', 'below'],
    Left: ['left'],
    Right: ['right'],
    Center: ['center'],
}
const buildPatternFromWord = (word: string) => {
    const caseInsensitive = `[${word[0].toUpperCase()}${word[0].toLowerCase()}]`
    const wordMatch = `${caseInsensitive}${word.substring(1)}`
    return `\s+${wordMatch}|${wordMatch}`
}
export default {
    locale: Locale.en_US,
    numbers, keywords, buildPatternFromWord,
} as Dictionary
