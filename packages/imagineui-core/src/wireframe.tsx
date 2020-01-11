import React from "preact/compat";
import {WiredInput} from "./wired-elements-react";
import {SceneDescription} from "./types/logic";

interface WireframeProps {
    sceneDescription: SceneDescription;
    className: string;
}

export const Wireframe = ({sceneDescription, className}: WireframeProps) => {
    return <div className={className}>
        <WiredInput placeholder="Placeholder"/>
    </div>
}
