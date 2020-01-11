import {Area, AreaType, Entity, Field, Interaction, SceneDescription, withPriority} from '../packages/imagineui-core/src/types/logic';

export function createCatalogueScene(): SceneDescription {
    const title: Field = {
        key: 'name',
        mutable: false,
        type: 'text',
        size: 'small',
    };

    const price: Field = {
        key: 'price',
        mutable: false,
        type: 'number',
        size: 'small',
    };

    const amountLeft: Field = {
        key: 'amount_left',
        mutable: false,
        type: 'number',
        size: 'small',
    };

    const photo: Field = {
        key: 'photo',
        mutable: false,
        type: 'image',
        size: 'large',
    };

    const description: Field = {
        key: 'description',
        mutable: false,
        type: 'text',
        size: 'large',
    };

    const itemEntity: Entity = {
        key: 'message_type',
        fields: [
            withPriority(title, 3),
            withPriority(photo, 3),
            withPriority(price, 3),
            withPriority(amountLeft, 1),
            withPriority(description, 1),
        ],
    };

    const browseInteraction: Interaction = {
        entity: itemEntity,
        primaryAction: 'browse',
        actions: ['read'],
    };

    const navBar: Area = {
        key: 'nav_bar',
        type: AreaType.NAVIGATE,
    };
    const itemList: Area = {
        key: 'item_list',
        type: AreaType.INTERACT,
        interaction: browseInteraction,
    };
    const filters: Area = {
        key: 'item_filters',
        type: AreaType.OPTIONS,
        fields: [withPriority(price, 1)],
    };

    return {
        key: 'messages_screen',
        areas: [
            withPriority(navBar, 1),
            withPriority(itemList, 5),
            withPriority(filters, 1),
        ],
        connectedScenes: [],
    };
}
