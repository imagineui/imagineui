// @ts-ignore
import {Az} from 'az';
import {NLProcessor} from "./nlp-store";

function initAz() {
    return new Promise(((resolve, reject) => {
        try {
            Az.Morph.init('https://unpkg.com/az@0.2.3/dicts', resolve)
        } catch (e) {
            reject(e)
        }
    }))
}

const conjunctions = ['или', 'и']

export async function initRussianNLP(): Promise<NLProcessor> {
    await initAz()
    return {
        locale: 'ru_RU',
        toNominativeCase(phrase: string): string {
            const tokens = phrase.split(' ')

            const marks = [0];

            tokens.forEach((token, index) => {
                conjunctions.includes(token)
                if(index && index < tokens.length - 1) {
                    marks.push(index + 1)
                }
            })

            marks.forEach(mark => {
                const results: any[] = Az.Morph(tokens[mark])
                const parsed = results.find(word => word.tag.CAse === "gent")
                tokens[mark] = parsed ? parsed.normalize().word : tokens[mark];
            })
            return tokens.join(' ')
        }
    }
}
