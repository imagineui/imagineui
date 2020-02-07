import * as path from "path";
import * as fs from "fs";
import {fonts} from "./inlinedbalsamiq";
import {render} from "preact-render-to-string";

const appDirectory = fs.realpathSync(process.cwd());
const bundlePath = path.resolve(appDirectory, './build/render-bundle.js')
const renderBundle = fs.readFileSync(bundlePath)
const cssPath = path.resolve(appDirectory, '../imagineui-core/src/wireframe.css')
const cssBundle = fs.readFileSync(cssPath)

export const renderWireframe = (component: preact.VNode) =>
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
