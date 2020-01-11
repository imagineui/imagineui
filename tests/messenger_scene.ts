import {Area, AreaType, Entity, Field, Interaction, SceneDescription, withPriority} from '../packages/imagineui-core/src/types/logic';

export function createMessengerScene(): SceneDescription {
    const name: Field = {
        key: 'name',
        mutable: false,
        type: 'text',
        size: 'small',
    };

    const avatar: Field = {
        key: 'avatar',
        mutable: false,
        type: 'image',
        size: 'small',
    };

    const content: Field = {
        key: 'content',
        mutable: true,
        type: 'text',
        size: 'large',
    };

    const messageEntity: Entity = {
        key: 'message_type',
        fields: [
            withPriority(avatar, 1),
            withPriority(name, 3),
            withPriority(content, 3),
        ],
    };

    const browseInteraction: Interaction = {
        entity: messageEntity,
        primaryAction: 'browse',
        actions: ['edit', 'delete'],
    };

    const sendInteraction: Interaction = {
        entity: messageEntity,
        primaryAction: 'add',
        actions: ['edit'],
    };

    const navBar: Area = {
        key: 'nav_bar',
        type: AreaType.NAVIGATE,
    };
    const messagesList: Area = {
        key: 'messages_list',
        type: AreaType.INTERACT,
        interaction: browseInteraction,
    };
    const messageInput: Area = {
        key: 'message_input',
        type: AreaType.INTERACT,
        interaction: sendInteraction,
    };

    return {
        key: 'messages_screen',
        areas: [
            withPriority(navBar, 1),
            withPriority(messagesList, 5),
            withPriority(messageInput, 3),
        ],
        connectedScenes: [],
    };
}
