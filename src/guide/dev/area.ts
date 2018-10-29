import {AreaGuider, EntityGuider} from '../../types/guide';
import {Constraints, LayoutItem, LayoutItemType, LimitTier, NavLink} from '../../types/inflate';
import {
    Action,
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

    private static stackLayouts(layoutItems: LayoutItem[], scrollable: boolean): LayoutItem {
        return {
            key: 'group',
            type: LayoutItemType.VERTICAL_GROUP,
            weight: 1,
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

        return DevAreaGuider.stackLayouts(areaLayouts, false);
    }

    public interactionToLayout(area: InteractionArea, isPrimary: boolean): LayoutItem {
        const { entity, primaryAction, actions } = area.interaction;

        const calculateLayout = (e: Entity, constraints: Constraints, action: Action) =>
            this.entityGuider.entityToLayout(e, DevAreaGuider.adjustConstraints(constraints, isPrimary), action);

        let rootLayout;
        switch (primaryAction) {
            case 'browse':
                const entityLayouts = [entity, entity, entity, entity, entity]
                    .map((it) => calculateLayout(it, listConstraints, primaryAction));
                rootLayout = DevAreaGuider.stackLayouts(entityLayouts, true);
                break;
            default:
                rootLayout = calculateLayout(entity, cardConstraints, primaryAction);
                break;
        }
        rootLayout.weight = isPrimary ? 5 : 1;
        return rootLayout;
    }

    public navigationToLayout(area: NavArea, isPrimary: boolean, navLinks: NavLink[]): LayoutItem {
        return {
            key: 'nav_area_span',
            type: LayoutItemType.CONTENT,
            weight: 1,
            contentType: 'span',
        };
    }

    public optionsToLayout(area: OptionsArea, isPrimary: boolean): LayoutItem {
        return {
            key: 'opts_area_span',
            type: LayoutItemType.CONTENT,
            weight: 1,
            contentType: 'span',
        };
    }
}