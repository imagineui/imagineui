import {default as program} from 'commander';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import {modifyInitialState, StateProvider} from 'imagineui-core/src/store';
import React from 'preact/compat';
import {Wireframe} from 'imagineui-core/src/wireframe';
import {IUIParseResult, parseSceneToAST} from 'imagineui-core/src/parse/ast';
import {initRussianNLP} from 'imagineui-core/src/locales/ru_RU/nlp';
import {getPageWidth} from 'imagineui-core/src/guides/sizes';
import {renderWireframe} from './template';

// tslint:disable-next-line:no-var-requires
const {version: PACKAGE_VERSION} = require('../package.json')

const collect = (value: string, previous: string[]) => previous.concat([value]);

program
    .version(PACKAGE_VERSION, '-v, --version')
    .option('-i, --input <path>', 'source file (.scene)', collect, [])
    .option('-d, --outputDir <path>', 'output path (format defined by renderer)', '.')
    // TODO: [cli] add support for fully qualified output names
    // .option('-o, --output <path>', 'output path (format defined by renderer)', collect, [])
    .option('-r, --renderer [type]', 'how should the scene be rendered [puppeteer]',
        'puppeteer')
    .parse(process.argv);

interface Source {
    ast: IUIParseResult
    inputPath: string
    outputPath: string
}

const sourceList = (program.input as string[]).map((inputPath: string) => {
    const scene = fs.readFileSync(inputPath, 'utf8')
    const ast = parseSceneToAST(scene + '\n')

    if (ast.lexErrors) {
        const firstError = ast.lexErrors[0]
        throw new Error(`${inputPath}\nCouldn\'t parse the input\n${firstError}`)
    }
    if (ast.parseErrors) {
        const firstError = ast.parseErrors[0]
        throw new Error(`${inputPath}\nCouldn\'t parse the input\n${firstError}`)
    }

    if (!ast.value) {
        throw new Error(`${inputPath}\nSource has yielded an empty AST`)
    }

    const basename = path.basename(inputPath);
    const outputFilename = basename.endsWith('.scene') ? basename.substring(0, basename.length - 6) : basename;
    const outputPath = path.resolve(program.outputDir, outputFilename + '.png')
    return {
        ast,
        inputPath,
        outputPath,
    }
})

// tslint:disable-next-line:no-eval
const dictsPath = path.resolve(eval('require.resolve(\'./cli.js\')'), '../dicts')

initRussianNLP(dictsPath).then(async nlp => {
    modifyInitialState({
        nlp,
    })

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    for (const {ast, outputPath} of sourceList) {
        const component = React.createElement(StateProvider, {},
            React.createElement(Wireframe, { sceneDescription: ast.value || null, className: 'wireframe'}))

        let width: number | null = null;
        const height = 600;
        const padding = 16;
        ast.value!.children.page.forEach(screenPage => {
            const newWidth = getPageWidth(screenPage);
            if (!width || (newWidth && width < newWidth))
                width = newWidth;
        });

        await page.setViewport({width: width ? (width + padding * 2) : 800, height})
        await page.setContent(renderWireframe(component))
        await page.evaluateHandle('document.fonts.ready')
        const result = await page.screenshot({
            type: 'png', fullPage: true,
        })
        fs.writeFile(outputPath, result, (err) => {
            if (err) {
                return console.log(err);
            }

            console.log(outputPath);
        });
    }

    await browser.close()
}).catch(error => {
    console.error(error)
    process.exit(1)
});
