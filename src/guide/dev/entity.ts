import {Entity, Field, FieldWithPriority} from '../../types/logic';
import {Constraints, LayoutItem, LayoutItemType, LimitTier} from '../../types/inflate';
import * as _ from 'lodash';
import {EntityGuider} from '../../types/guide';

export function fieldPriority(a: FieldWithPriority, b: FieldWithPriority) {
    const weightDifference = a.priorityWeight - b.priorityWeight;
    if (weightDifference !== 0) {
        return weightDifference;
    }

    const isSizeDifferent = a.item.size === b.item.size;
    const aIsSmall = a.item.size === 'small';
    if (!isSizeDifferent) {
        return 0;
    } else if (aIsSmall) {
        return -1;
    } else {
        return 1;
    }
}

export enum DevFixedWeights {
    LIGHT = 1,
    MEDIUM = 2,
    HUGE = 5,
}
// TODO: Screen size guides
const DEV_LINE_BREAK_WEIGHT = 8;

export default class DevEntityGuider implements EntityGuider {
    private static widgetPairToGroup(a?: LayoutItem, b?: LayoutItem): LayoutItem {
        if (a === undefined || a === null) {
            return b;
        }
        if (a.weight + b.weight < DEV_LINE_BREAK_WEIGHT) {
            return {
                type: LayoutItemType.HORIZONTAL_GROUP,
                weight: a.weight + b.weight,
                items: [a, b],
            };
        } else {
            return {
                type: LayoutItemType.VERTICAL_GROUP,
                weight: _.max([a.weight, b.weight]),
                items: [a, b],
                reverse: false,
                scrollable: false,
            };
        }
    }

    public blockWeight(size: 'small' | 'large', constraints: Constraints): DevFixedWeights {
        switch (constraints.heightLimit) {
            case LimitTier.FREE:
                return size === 'large' ? DevFixedWeights.HUGE : DevFixedWeights.LIGHT;
            default:
                return size === 'large' ? DevFixedWeights.MEDIUM : DevFixedWeights.LIGHT;
        }
    }

    public spanWeight(size: 'small' | 'large', constraints: Constraints): DevFixedWeights {
        switch (constraints.widthLimit) {
            case LimitTier.FREE:
                return size === 'large' ? DevFixedWeights.HUGE : DevFixedWeights.LIGHT;
            default:
                return size === 'large' ? DevFixedWeights.MEDIUM : DevFixedWeights.LIGHT;
        }
    }

    public collapseLayouts(widgets: LayoutItem[], constraints: Constraints): LayoutItem {
        let widgetSubset: LayoutItem[];
        switch (constraints.heightLimit) {
            case LimitTier.FREE:
                widgetSubset = widgets;
                break;
            case LimitTier.SHARED:
                widgetSubset = widgets.slice(0, _.min([widgets.length, 4]));
                break;
            case LimitTier.CONSERVE:
                widgetSubset = widgets.slice(0, _.min([widgets.length, 2]));
        }

        return widgetSubset.reduceRight((prev, cur) => DevEntityGuider.widgetPairToGroup(prev, cur));
    }

    public fieldToLayout(field: Field, constraints: Constraints): LayoutItem {
        switch (field.type) {
            case 'image':
                return {
                    type: LayoutItemType.CONTENT,
                    weight: this.blockWeight(field.size, constraints),
                    contentType: 'block',
                };
            default:
                return {
                    type: LayoutItemType.CONTENT,
                    weight: this.spanWeight(field.size, constraints),
                    contentType: 'span',
                };
        }
    }

    public entityToLayout(entity: Entity, constraints: Constraints): LayoutItem {
        const sortedFields = entity.fields.sort(fieldPriority).map((it) => it.item);
        const widgets = sortedFields.map((it) => this.fieldToLayout(it, constraints));
        return this.collapseLayouts(widgets, constraints);
    }
}
