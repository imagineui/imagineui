import program from 'commander';
import * as fs from 'fs';
import {describeSceneFromAST} from '../../imagineui-core/src/parse/ast';
import AreaGuider from '../../imagineui-core/src/guide/dev/area';
import EntityGuider from '../../imagineui-core/src/guide/dev/entity';
import calculateLayout from '../../imagineui-core/src/render/viewCalculation';
import ViewRenderer from '../../imagineui-core/src/render/viewToSvg';

program
    .version('0.1.0', '-v, --version')
    .option('-i, --input <path>', 'source file (.scene)')
    .option('-o, --output <path>', 'output path (format defined by renderer)')
    .option('-r, --renderer [type]', 'how should the scene be rendered [json, wireframe-svg, crayon-png]',
        'wireframe-svg')
    .parse(process.argv);

const guider = new AreaGuider(new EntityGuider());
const scene = describeSceneFromAST(program.input);
const layout = guider.sceneToLayout(scene);
const view = calculateLayout(layout);
const data = new ViewRenderer().renderView(view);


fs.writeFile(program.output, data, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Render complete!');
    console.log(program.output);
});
