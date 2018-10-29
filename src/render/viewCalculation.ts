import {LayoutItem, View} from '../types/inflate';

export default function calculateLayout(layout: LayoutItem): View {
    // TODO: Layout calculation with Yoga Layouts
    return {
        type: 'solid',
        children: [],
        layout: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            height: 50,
            width: 50,
        },
    };
}
