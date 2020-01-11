import * as fs from 'fs';
import yaml from 'js-yaml';
import {SceneDescription} from '../types/logic';

// TODO: Implement scene parser
export function describeSceneFromAST(inputPath: string): SceneDescription {
    return yaml.safeLoad(fs.readFileSync(inputPath, 'utf8'));
}

export function parseSceneFromText(sceneText: string): SceneDescription {
    return {
        key: sceneText,
        areas: [],
        connectedScenes: []
    }
}
