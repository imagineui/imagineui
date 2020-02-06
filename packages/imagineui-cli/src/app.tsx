import {default as program} from 'commander';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import {modifyInitialState, StateProvider} from "imagineui-core/src/store";
import React from "preact/compat";
import {render} from "preact-render-to-string";
import {Wireframe} from "imagineui-core/src/wireframe";
import {parseSceneToAST} from "imagineui-core/src/parse/ast";
import {initRussianNLP} from "imagineui-core/src/locales/ru_RU/nlp";
import {fonts} from "./inlinedbalsamiq";
import {getPageWidth} from "imagineui-core/src/guides/sizes";

program
    .version('0.2.0', '-v, --version')
    .option('-i, --input <path>', 'source file (.scene)')
    .option('-o, --output <path>', 'output path (format defined by renderer)')
    .option('-r, --renderer [type]', 'how should the scene be rendered [puppeteer]',
        'puppeteer')
    .parse(process.argv);

const scene = fs.readFileSync(program.input, 'utf8')
const ast = parseSceneToAST(scene + '\n')

if(ast.lexErrors) {
    const firstError = ast.lexErrors[0]
    throw new Error(`Couldn\'t parse the input\n${firstError}`)
}
if(ast.parseErrors) {
    const firstError = ast.parseErrors[0]
    throw new Error(`Couldn\'t parse the input\n${firstError}`)
}

if (!ast.value) {
    process.abort()
}
const appDirectory = fs.realpathSync(process.cwd());
const dictsPath = path.resolve(appDirectory, '../../node_modules/az/dicts')

initRussianNLP(dictsPath).then(async nlp => {
    modifyInitialState({
        nlp
    })

    const component = React.createElement(StateProvider, {},
        React.createElement(Wireframe, { sceneDescription: ast.value || null, className: 'wireframe'}))

    const bundlePath = path.resolve(appDirectory, './build/render-bundle.js')
    const renderBundle = fs.readFileSync(bundlePath)
    const cssPath = path.resolve(appDirectory, '../imagineui-core/src/wireframe.css')
    const cssBundle = fs.readFileSync(cssPath)
    const html =
`<!DOCTYPE html>
<html lang="en">
    <head>
        <title>ImagineUI Rendered wireframe</title>
        <script lang="application/javascript">
        ${renderBundle}
        </script>
        <style>
        ${fonts}
        ${cssBundle}
        </style>
    </head>
    <body>
        ${render(component)}
    </body>
</html>
`
    let width : number | null = null;
    const height = 600;
    const padding = 16;
    ast.value!.children.page.forEach(page => {
        const newWidth = getPageWidth(page);
        if(!width || (newWidth && width < newWidth))
            width = newWidth;
    });

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({width: width ? (width + padding * 2) : 800, height})
    await page.setContent(html)
    await page.evaluateHandle('document.fonts.ready')
    const result = await page.screenshot({
        type: 'png', fullPage: true
    })
    fs.writeFile(program.output, result, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log('Render complete!');
        console.log(program.output);
    });
    await browser.close()
}).catch(error => {
    console.error(error)
    process.exit(1)
});
