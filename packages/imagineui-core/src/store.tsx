import * as React from 'react';

import {createContext, useReducer} from 'react';
import {ComponentChildren} from 'preact';

export interface NLProcessor {
    locale: 'ru_RU'
    toNominativeCase(phrase: string): string
}

export interface WireframeState {
    nlp?: NLProcessor
}

export const initialState: WireframeState = {

}

export const modifyInitialState = (state: Partial<WireframeState>) =>
    Object.assign(initialState, state)

export interface WireframeContext {
    state: WireframeState,
    dispatch: (action: WireframeAction) => void,
}

export enum WireframeActionTypes {
    SET_NLP = 'SET_NLP', SET_VARIABLES = 'SET_VARIABLES',
}

interface SetNlpAction {
    type: WireframeActionTypes.SET_NLP
    nlp: NLProcessor
}

interface SetVariablesAction {
    type: WireframeActionTypes.SET_VARIABLES
}

type WireframeAction = SetNlpAction | SetVariablesAction

export const wireframeContext = createContext<WireframeContext>({
    state: initialState,
    dispatch: (action) => console.error('Reducer wasn\'t bound before action fired', action),
});

const { Provider } = wireframeContext;

export const StateProvider = ( { children }: {children?: ComponentChildren} ) => {
    // @ts-ignore
    const [state, dispatch] = useReducer<WireframeState, WireframeAction>((curState, action) => {
        switch (action.type) {
            case WireframeActionTypes.SET_NLP:
                return {
                    ...curState,
                    nlp: action.nlp,
                };
            case WireframeActionTypes.SET_VARIABLES:
                throw new Error('SET_VARIABLES Not implemented');
            default:
                throw new Error('');
        }
    }, initialState);

    return <Provider value={{ state, dispatch }}>{children}</Provider>;
};
