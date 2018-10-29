// TODO: Add type definitions for 'svgdom'
const window = require('svgdom');
const SVG = require('svg.js')(window);
import * as svgjs from 'svg.js';
// @ts-ignore
const document = window.document;

import {View} from '../types/inflate';

// TODO: DAEMON: Create separate document elements for each render
export default class ViewRenderer {
    private draw: svgjs.Doc = SVG(document.documentElement);

    public renderView(view: View): string {
        const { width, height, top, left } = view.layout;

        const rect = this.draw
            .rect(width, height)
            .move(top, left);

        switch (view.type) {
            case 'solid':
                rect.fill('black')
                    .opacity(0.5);
                break;
            default:
                rect.stroke({
                    color: 'black',
                    width: 4,
                    opacity: 0.5,
                });
        }

        view.children.forEach(this.renderView);

        return this.draw.svg();
    }
}