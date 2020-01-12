import React from 'preact/compat';
import {render, useState, useCallback, useEffect} from 'preact/compat';
import {Wireframe} from "imagineui-core/src/wireframe";
import {SceneDescription} from "imagineui-core/src/types/logic";
import {parseSceneFromText} from "imagineui-core/src/parse/ast";
import './index.css';
import {Editor} from "./editor";

const NULL_SCENE: SceneDescription = {
    key: 'NULL',
    areas: [],
    connectedScenes: []
}

const Playground = () => {
    const [sceneText, setSceneText] = useState('')
    const [parseMessage, setParseMessage] = useState('')
    const [sceneAST, setSceneAST] = useState<SceneDescription>(NULL_SCENE)
    const onChange = useCallback((ev: any) => {
        setSceneText(ev.target.value)
    }, [setSceneText])
    useEffect(() => {
        try {
            const ast = parseSceneFromText(sceneText)
            setSceneAST(ast)
            setParseMessage(JSON.stringify(ast, undefined, 2))
        } catch (e) {
            setSceneAST(NULL_SCENE)
            setParseMessage(JSON.stringify(e, undefined, 2))
        }
    }, [sceneText, setParseMessage, setSceneAST])
    return <div className="playground">
        <Editor/>
        <div className="output">{parseMessage}</div>
        <Wireframe className="wireframe" sceneDescription={sceneAST}/>
    </div>
}

render(<Playground/>, document.getElementById('root')!);
