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
const prepositions = ['с', 'для']
const cases = ['gent', 'ablt']

export async function initRussianNLP(): Promise<NLProcessor> {
    await initAz()
    return {
        locale: 'ru_RU',
        toNominativeCase(phrase: string): string {
            const tokens = phrase.split(' ')

            if(prepositions.includes(tokens[0])) {
                tokens.shift()
            }

            if(tokens.length < 1) {
                return phrase
            }

            const marks = [0];

            tokens.forEach((token, index) => {
                conjunctions.includes(token)
                if(index && index < tokens.length - 1) {
                    marks.push(index + 1)
                }
            })

            marks.forEach(mark => {
                const results: any[] = Az.Morph(tokens[mark])
                    .filter(({score, tag}: {score: number, tag: any}) => (score > 0.5 && !tag.Abbr))
                const parsed = results.find(word => cases.includes(word.tag.CAse))
                tokens[mark] = parsed ? parsed.normalize().word : tokens[mark];
            })
            return tokens.join(' ')
        }
    }
}
