import {default as program} from 'commander';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import {modifyInitialState, StateProvider} from "imagineui-core/src/store";
import React from "preact/compat";
import {Wireframe} from "imagineui-core/src/wireframe";
import {ParseResult, parseSceneToAST} from "imagineui-core/src/parse/ast";
import {initRussianNLP} from "imagineui-core/src/locales/ru_RU/nlp";
import {getPageWidth} from "imagineui-core/src/guides/sizes";
import {renderWireframe} from "./template";

const collect = (value: string, previous: string[]) => previous.concat([value]);

program
    .version('0.2.0', '-v, --version')
    .option('-i, --input <path>', 'source file (.scene)', collect, [])
    .option('-d, --outputDir <path>', 'output path (format defined by renderer)')
    // TODO: [cli] add support for fully qualified output names
    // .option('-o, --output <path>', 'output path (format defined by renderer)', collect, [])
    .option('-r, --renderer [type]', 'how should the scene be rendered [puppeteer]',
        'puppeteer')
    .parse(process.argv);

interface Source {
    ast: ParseResult
    inputPath: string
    outputPath: string
}

const sourceList = (program.input as string[]).map((inputPath: string) => {
    const scene = fs.readFileSync(inputPath, 'utf8')
    const ast = parseSceneToAST(scene + '\n')

    if(ast.lexErrors) {
        const firstError = ast.lexErrors[0]
        throw new Error(`${inputPath}\nCouldn\'t parse the input\n${firstError}`)
    }
    if(ast.parseErrors) {
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
        outputPath
    }
})

const appDirectory = fs.realpathSync(process.cwd());
const dictsPath = path.resolve(appDirectory, '../../node_modules/az/dicts')

initRussianNLP(dictsPath).then(async nlp => {
    modifyInitialState({
        nlp
    })

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    for (let i = 0; i < sourceList.length; i++) {
        const {ast, outputPath} = sourceList[i];
        const component = React.createElement(StateProvider, {},
            React.createElement(Wireframe, { sceneDescription: ast.value || null, className: 'wireframe'}))

        let width : number | null = null;
        const height = 600;
        const padding = 16;
        ast.value!.children.page.forEach(page => {
            const newWidth = getPageWidth(page);
            if(!width || (newWidth && width < newWidth))
                width = newWidth;
        });

        await page.setViewport({width: width ? (width + padding * 2) : 800, height})
        await page.setContent(renderWireframe(component))
        await page.evaluateHandle('document.fonts.ready')
        const result = await page.screenshot({
            type: 'png', fullPage: true
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
