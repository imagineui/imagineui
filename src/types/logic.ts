
/**
 * @field item the wrapped item
 * @field priority The larger the number, the more likely this field will be used, when there is not enough space
 */
export interface PriorityWrapper<T> {
    item: T;
    priorityWeight: number;
}

export function withPriority<T>(item: T, priorityWeight: number) {
    return {item, priorityWeight};
}

/**
 * TODO: Decide if nested entity structures are allowed
 *
 * @field mutable Does it make sense to edit this field for our user
 * @field type General kind of data that the field represents
 * @field size How much relative screen space should be given to the field in order to be eligible
 */
export interface Field {
    key: string;
    mutable: boolean;
    type: 'text' | 'number' | 'boolean' | 'enum' | 'image';
    size: 'small' | 'large';
}

export type FieldWithPriority = PriorityWrapper<Field>;

/**
 * Entity
 * Abstract model that user interacts with (create, read, update, delete, etc.)
 *
 * For instance, a message in IM or an item in eCommerce.
 *
 * @field fields Contents of said entity
 */
export interface Entity {
    key: string;
    fields: FieldWithPriority[];
}

/**
 *
 */
export type Action = 'browse' | 'read' | 'edit' | 'add' | 'delete';

/**
 * Interaction
 * Description of what is the user supposed to do with an entity.
 *
 * @field entity The type to be interacted with
 * @field primaryAction Main purpose for the interaction
 * @field actions What is allowed to do with the type
 */
export interface Interaction {
    entity: Entity;
    primaryAction: Action;
    actions: Action[];
}

/**
 * AreaType
 * What is the described area meant for
 *
 * INTERACT - User interaction with a certain entity type (i.e. send a message)
 * NAVIGATE – Access other scenes and secondary actions
 * OPTIONS – Tweak the interaction above (i.e. filter the browsed item list)
 */
export enum AreaType {
    INTERACT = 'interact',
    OPTIONS = 'options',
    NAVIGATE = 'navigate',
}

export type Area = InteractionArea | NavArea | OptionsArea;

export interface InteractionArea {
    key: string;
    type: AreaType.INTERACT;
    interaction: Interaction;
}

export interface OptionsArea {
    key: string;
    type: AreaType.OPTIONS;
    fields: FieldWithPriority[];
}

export interface NavArea {
    key: string;
    type: AreaType.NAVIGATE;
}

export type AreaWithPriority = PriorityWrapper<Area>;

/**
 * SceneDescription
 * Set of areas and neighbour scenes that allow user to access a certain feature
 *
 * @field areas What is the user supposed to be doing
 * @field connectedScenes where does it make sense for the user to go from this scene
 */
export interface SceneDescription {
    key: string;
    areas: AreaWithPriority[];
    connectedScenes: SceneDescription[];
}
