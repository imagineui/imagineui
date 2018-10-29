import { createMessengerScene } from '../../tests/messenger_scene';
import {SceneDescription} from '../types/logic';

// TODO: Implement scene parser
export function describeSceneFromAST(): SceneDescription {
    return createMessengerScene();
}
