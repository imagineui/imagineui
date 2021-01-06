
export enum Locale {
    ru_RU = 'ru_RU',
    en_US = 'en_US',
}

/**
 * Natural language numerics are limited to a 12-column system
 * TODO: Consider parsing all numerals
 */
export interface NumericDictionary {
    zero: string[];
    one: string[];
    two: string[];
    three: string[];
    four: string[];
    five: string[];
    six: string[];
    seven: string[];
    eight: string[];
    nine: string[];
    ten: string[];
    eleven: string[];
    twelve: string[];
}

export interface KeywordDictionary {
    page: string[];
    mobile: string[];
    tablet: string[];
    widescreen: string[];

    block: string[];
    blocks: string[];
    example: string[];

    header: string[];
    field: string[];
    button: string[];
    list: string[];
    image: string[];

    consists_of: string[];
    with_icon: string[];

    aligned: string[];
    rows: string[];
    columns: string[];

    top: string[];
    bottom: string[];
    left: string[];
    right: string[];
    center: string[];
}

export interface Dictionary {
    locale: Locale,
    numbers: NumericDictionary,
    keywords: KeywordDictionary,
    buildPatternFromWord: (word: string) => string
}
