import program from 'commander';
import * as fs from 'fs';
import {describeSceneFromAST} from './parse/ast';
import AreaGuider from './guide/dev/area';
import EntityGuider from './guide/dev/entity';
import calculateLayout from './render/viewCalculation';
import ViewRenderer from './render/viewToSvg';

program
    .version('0.1.0', '-v, --version')
    .option('-i, --input <path>', 'source file (.scene)')
    .option('-o, --output <path>', 'output path (format defined by renderer)')
    .option('-r, --renderer [type]', 'how should the scene be rendered [json, wireframe-svg, crayon-png]',
        'wireframe-svg')
    .parse(process.argv);

const guider = new AreaGuider(new EntityGuider());

const scene = describeSceneFromAST();
const layout = guider.sceneToLayout(scene);

const view = calculateLayout(layout);
const data = new ViewRenderer().renderView(view);

console.log(program.output);

fs.writeFile(program.output, data, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Render complete!');
});
