import {AreaGuider, EntityGuider} from '../../types/guide';
import {Constraints, LayoutItem, LayoutItemType, LimitTier, NavLink} from '../../types/inflate';
import {
AreaType,
AreaWithPriority,
Entity,
InteractionArea,
NavArea,
OptionsArea,
SceneDescription,
} from '../../types/logic';

const listConstraints: Constraints = {
    heightLimit: LimitTier.SHARED,
    widthLimit: LimitTier.SHARED,
};

const cardConstraints: Constraints = {
    heightLimit: LimitTier.FREE,
    widthLimit: LimitTier.FREE,
};

export function areaPriority(a: AreaWithPriority, b: AreaWithPriority) {
    const weightDifference = a.priorityWeight - b.priorityWeight;
    if (weightDifference !== 0) {
        return weightDifference;
    }

    const isSizeDifferent = a.item.type === b.item.type;
    const aIsInteract = a.item.type === AreaType.INTERACT;
    if (!isSizeDifferent) {
        return 0;
    } else if (aIsInteract) {
        return 1;
    } else {
        return -1;
    }
}

export default class DevAreaGuider implements AreaGuider {

    private static adjustConstraints(constraints: Constraints, isPrimary: boolean): Constraints {
        return {
            heightLimit: isPrimary ? constraints.heightLimit : LimitTier.CONSERVE,
            widthLimit: constraints.widthLimit,
        };
    }

    private static stackLayouts(layoutItems: LayoutItem[], weight: number, scrollable: boolean): LayoutItem {
        return {
            type: LayoutItemType.VERTICAL_GROUP,
            weight,
            items: layoutItems,
            reverse: false,
            scrollable,
        };
    }

    private entityGuider: EntityGuider;

    constructor(entityGuider: EntityGuider) {
        this.entityGuider = entityGuider;
    }

    public sceneToLayout(scene: SceneDescription): LayoutItem {

        // TODO: Make sure that the resulting order is intuitive
        const primaryArea = scene.areas.reduce((prev, cur) => {
            if (areaPriority(prev, cur) > 0) {
                return prev;
            } else {
                return cur;
            }
        });
        const primaryKey = primaryArea.item.key;

        const areaLayouts = scene.areas.map((it) => {
            const { item } = it;
            const isPrimary = item.key === primaryKey;

            switch (item.type) {
                case AreaType.INTERACT:
                    return this.interactionToLayout(item, isPrimary);
                case AreaType.NAVIGATE:
                    const navLinks: NavLink[] = scene.connectedScenes.map((sc, i) =>
                        ({ key: i.toString(), targetSceneKey: sc.key }));

                    return this.navigationToLayout(item, isPrimary, navLinks);
                case AreaType.OPTIONS:
                    return this.optionsToLayout(item, isPrimary);
            }
        });

        return DevAreaGuider.stackLayouts(areaLayouts, 1, false);
    }

    public interactionToLayout(area: InteractionArea, isPrimary: boolean): LayoutItem {
        const { entity, primaryAction, actions } = area.interaction;

        const calculateLayout = (e: Entity, constraints: Constraints) =>
            this.entityGuider.entityToLayout(e, DevAreaGuider.adjustConstraints(constraints, isPrimary));

        switch (primaryAction) {
            case 'browse':
                const entityLayouts = [entity, entity, entity].map((it) => calculateLayout(it, listConstraints));
                return DevAreaGuider.stackLayouts(entityLayouts, 5, true);
            default:
                return calculateLayout(entity, cardConstraints);
        }
    }

    public navigationToLayout(area: NavArea, isPrimary: boolean, navLinks: NavLink[]): LayoutItem {
        return {
            type: LayoutItemType.CONTENT,
            weight: 1,
            contentType: 'span',
        };
    }

    public optionsToLayout(area: OptionsArea, isPrimary: boolean): LayoutItem {
        return {
            type: LayoutItemType.CONTENT,
            weight: 1,
            contentType: 'span',
        };
    }
}