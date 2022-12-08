
export enum Locale {
    ru_RU = 'ru_RU',
    en_US = 'en_US',
}

/**
 * Natural language numerics are limited to a 12-column system
 * TODO: Consider parsing all numerals
 */
export interface NumericDictionary {
    Zero: string[];
    One: string[];
    Two: string[];
    Three: string[];
    Four: string[];
    Five: string[];
    Six: string[];
    Seven: string[];
    Eight: string[];
    Nine: string[];
    Ten: string[];
    Eleven: string[];
    Twelve: string[];
}

export interface KeywordDictionary {
    Page: string[];
    Mobile: string[];
    Tablet: string[];
    Widescreen: string[];

    Block: string[];
    Blocks: string[];

    Header: string[];
    Field: string[];
    Button: string[];
    List: string[];
    Image: string[];
    Space: string[];

    ConsistsOf: string[];
    WithIcon: string[];

    Aligned: string[];
    Rows: string[];
    Columns: string[];

    Top: string[];
    Bottom: string[];
    Left: string[];
    Right: string[];
    Center: string[];
}

export interface Dictionary {
    locale: Locale,
    numbers: NumericDictionary,
    keywords: KeywordDictionary,
    buildPatternFromWord: (word: string) => string
}
