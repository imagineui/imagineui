import {Dictionary, KeywordDictionary, Locale, NumericDictionary} from '../types';

const numbers: NumericDictionary = {
    zero: ['ноль', 'ноля', 'нолю'],
    one: ['один', 'одна', 'одного', 'одну', 'одним', 'одной'],
    two: ['два', 'две', 'двум', 'двумя'],
    three: ['три', 'трём', 'тремя'],
    four: ['четыре', 'четырём', 'четыремя'],
    five: ['пять', 'пяти', 'пятью'],
    six: ['шесть', 'шести', 'шестью'],
    seven: ['семь', 'семи', 'семью'],
    eight: ['восемь', 'восьми', 'восьмью'],
    nine: ['девять', 'девяти', 'девятью'],
    ten: ['десять', 'десяти', 'десятью'],
    eleven: ['одиннадцать', 'одиннадцати', 'одиннадцатью'],
    twelve: ['двенадцать', 'двенадцати', 'двенадцатью'],
}
// TODO: [perf] Pre-bake patterns with all necessary inflections with a compile-time script
const keywords: KeywordDictionary = {
    page: ['страница:', 'экран:'],
    mobile: ['мобильный', 'мобильная'],
    tablet: ['планшетный', 'планшетная', 'ноутбучный', 'ноутбучная'],
    widescreen: ['широкоформатный', 'широкоформатная'],

    block: ['блок:'],
    blocks: ['блоки'],
    example: ['примеры:'],

    header: ['заголовок'],
    field: ['поле ввода', 'поле'],
    button: ['кнопка', 'ссылка'],
    list: ['список'],
    image: ['картинка'],

    consists_of: ['включает в себя'],
    aligned: ['расположены в', 'расположены'],
    // in: ['в'],
    with_icon: ['с иконкой'],
    rows: ['строка', 'строку', 'строчка', 'строчку', 'строки', 'строк', 'строкой', 'строчкой', 'строками', 'строчками'],
    columns: ['столбец', 'столбца', 'столбцов', 'столбцом'], // TODO: [lint] Auto-correction for plural inflections

    top: ['верхний', 'сверху'],
    bottom: ['нижний', 'сверху'],
    left: ['левый', 'слева'],
    right: ['правый', 'справа'],
    center: ['по центру'],
}
const buildPatternFromWord = (word: string) => {
    const caseInsensitive = `[${word[0].toUpperCase()}${word[0].toLowerCase()}]`
    const wordMatch = `${caseInsensitive}${word.substring(1).replace('ё', '[её]')}`
    return `\s+${wordMatch}|${wordMatch}`
}

export default {
    locale: Locale.ru_RU,
    numbers, keywords, buildPatternFromWord,
} as Dictionary
