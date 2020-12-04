import {fonts} from './inlinedbalsamiq';
import {render} from 'preact-render-to-string';

import renderBundle from '!!raw-loader!../build/render-bundle.js'
import cssBundle from '!!raw-loader!../../imagineui-core/src/wireframe.css'

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
