// TODO: Add type definitions for 'svgdom'
const window = require('svgdom');
const SVG = require('svg.js')(window);
import * as svgjs from 'svg.js';
// @ts-ignore
const document = window.document;

import {View} from '../types/inflate';

interface Position {
    top: number;
    left: number;
}

const defaultPosition = {
    top: 0,
    left: 0,
};

function addOffset(position: Position, top: number, left: number): Position {
    return {
        top: position.top + top,
        left: position.left + left,
    };
}

// TODO: DAEMON: Create separate document elements for each render
export default class ViewRenderer {
    private draw: svgjs.Doc = SVG(document.documentElement);

    public renderView(view: View, offset: Position = defaultPosition): string {
        const { width, height, top, left } = view.layout;

        const position = addOffset(offset, top, left);

        const rect = this.draw
            .rect(width, height)
            .move(position.left, position.top);

        switch (view.type) {
            case 'solid':
            case 'text':
                rect.fill('black')
                    .opacity(0.1);
                break;
            case 'wire':
                rect.fill('#00000000')
                    .stroke({
                    color: 'black',
                    width: 8,
                    opacity: 0.25,
                });
        }

        view.children.forEach((it) => this.renderView(it, position));

        return this.draw.svg();
    }
}