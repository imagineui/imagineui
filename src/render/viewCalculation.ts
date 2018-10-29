import {DIRECTION_LTR, EDGE_ALL, FLEX_DIRECTION_COLUMN, FLEX_DIRECTION_ROW, Node, YogaNode} from 'yoga-layout';
import {LayoutItem, LayoutItemType, View} from '../types/inflate';

interface MeasuredLayout {
    layout: LayoutItem;
    node: YogaNode;
    measuredChildren: MeasuredLayout[];
}

function prepareLayoutForMeasure(layout: LayoutItem): MeasuredLayout {
    const node = Node.create();
    node.setFlex(layout.weight);
    let measuredChildren: MeasuredLayout[] = [];
    switch (layout.type) {
        case LayoutItemType.HORIZONTAL_GROUP:
            node.setFlexDirection(FLEX_DIRECTION_ROW);
            measuredChildren = layout.items.map(prepareLayoutForMeasure);
            measuredChildren.forEach((it, index) => node.insertChild(it.node, index));
            break;
        case LayoutItemType.VERTICAL_GROUP:
            node.setFlexDirection(FLEX_DIRECTION_COLUMN);
            measuredChildren = layout.items.map(prepareLayoutForMeasure);
            measuredChildren.forEach((it, index) => node.insertChild(it.node, index));
            break;
        case LayoutItemType.CONTENT:
            node.setMargin(EDGE_ALL, 12);
            break;
    }
    return { layout, node, measuredChildren };
}

function measuredToView(measured: MeasuredLayout): View {
    const { layout } = measured;

    let type: 'text' | 'wire' | 'solid';
    switch (layout.type) {
        case LayoutItemType.CONTENT:
            type = 'solid';
            break;
        default:
            type = 'wire';
            break;
    }

    return {
        key: layout.key,
        type,
        children: measured.measuredChildren.map(measuredToView),
        layout: measured.node.getComputedLayout(),
    };
}

export default function calculateLayout(layout: LayoutItem): View {

    // TODO: Guide screen profiles
    const screenHeight = 720;
    const screenWidth = 405;

    const root = Node.create();
    root.setHeight(screenHeight); // 16x9, mobile, portrait
    root.setWidth(screenWidth);
    root.setFlexGrow(1);

    const layoutToMeasure = prepareLayoutForMeasure(layout);
    root.insertChild(layoutToMeasure.node, 0);
    root.calculateLayout(screenWidth, screenHeight, DIRECTION_LTR);

    // console.log(JSON.stringify(layoutToMeasure, undefined, 4));

    return measuredToView(layoutToMeasure);
}
