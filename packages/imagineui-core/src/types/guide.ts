import { DevFixedWeights } from '../guide/dev/entity';
import {Constraints, LayoutItem, NavLink} from './inflate';
import {Action, Area, Entity, Field, InteractionArea, NavArea, OptionsArea, SceneDescription} from './logic';

// TODO: Define UI guideline API
export interface EntityGuider {
    fieldToLayout(field: Field, constraints: Constraints): LayoutItem;
    entityToLayout(entity: Entity, constraints: Constraints, action: Action): LayoutItem;
    collapseLayouts(widgets: LayoutItem[], constraints: Constraints): LayoutItem;
    blockWeight(size: 'small' | 'large', constraints: Constraints): DevFixedWeights;
    spanWeight(size: 'small' | 'large', constraints: Constraints): DevFixedWeights;
}

export interface AreaGuider {
    sceneToLayout(scene: SceneDescription): LayoutItem;
    interactionToLayout(area: InteractionArea, isPrimary: boolean): LayoutItem;
    navigationToLayout(area: NavArea, isPrimary: boolean, navLinks: NavLink[]): LayoutItem;
    optionsToLayout(area: OptionsArea, isPrimary: boolean): LayoutItem;
}

//     let lastWidget = _.last(widgets);
//     widgets.slice(0, widgets.length - 1).reverse().forEach((it) => {
//         lastWidget = ;
//     });
//     return lastWidget;
// }
