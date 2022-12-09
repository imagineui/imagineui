import {Dictionary, KeywordDictionary, Locale, NumericDictionary} from '../types';

const numbers: NumericDictionary = {
    Zero: ['ноль', 'ноля', 'нолю'],
    One: ['один', 'одна', 'одного', 'одну', 'одним', 'одной'],
    Two: ['два', 'две', 'двум', 'двумя'],
    Three: ['три', 'трём', 'тремя'],
    Four: ['четыре', 'четырём', 'четыремя'],
    Five: ['пять', 'пяти', 'пятью'],
    Six: ['шесть', 'шести', 'шестью'],
    Seven: ['семь', 'семи', 'семью'],
    Eight: ['восемь', 'восьми', 'восьмью'],
    Nine: ['девять', 'девяти', 'девятью'],
    Ten: ['десять', 'десяти', 'десятью'],
    Eleven: ['одиннадцать', 'одиннадцати', 'одиннадцатью'],
    Twelve: ['двенадцать', 'двенадцати', 'двенадцатью'],
}
// TODO: [perf] Pre-bake patterns with all necessary inflections with a compile-time script
const keywords: KeywordDictionary = {
    Page: ['страница:', 'экран:'],
    Mobile: ['мобильный', 'мобильная'],
    Tablet: ['планшетный', 'планшетная', 'ноутбучный', 'ноутбучная'],
    Widescreen: ['широкоформатный', 'широкоформатная'],

    Block: ['блок:'],
    Blocks: ['блоки'],

    Header: ['заголовок'],
    Field: ['поле ввода', 'поле'],
    Button: ['кнопка', 'ссылка'],
    List: ['список'],
    Image: ['картинка'],
    Space: ['пустота', 'пустое пространство'],

    ConsistsOf: ['включает в себя'],
    Aligned: ['расположены в', 'расположены'],
    // in: ['в'],
    WithIcon: ['с иконкой'],
    Rows: ['строка', 'строку', 'строчка', 'строчку', 'строки', 'строк', 'строкой', 'строчкой', 'строками', 'строчками'],
    Columns: ['столбец', 'столбца', 'столбцов', 'столбцом'], // TODO: [lint] Auto-correction for plural inflections

    FillingTheScreen: ['заполняет экран', 'заполняющая экран'],

    Top: ['верхний', 'сверху'],
    Bottom: ['нижний', 'сверху'],
    Left: ['левый', 'слева'],
    Right: ['правый', 'справа'],
    Center: ['по центру'],
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
