import React, {useEffect, useRef} from 'preact/compat'
import * as monaco from "monaco-editor/esm/vs/editor/editor.api"
import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import {KEYWORDS_PATTERN} from "imagineui-core/src/parse/grammar";

// const onigasmWasm = require('onigasm/lib/onigasm.wasm') TODO: Webpack WASM Loader https://github.com/webpack/webpack/issues/7352
// const syntax = require('./scene_syntax.xml') TODO: Fix raw file loader
const syntax = `
<?xml  version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN"   "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0" >
    <!-- Generated via Iro -->
    <dict>
        <key>fileTypes</key>
        <array>
            <string>scene</string>
        </array>
        <key>name</key>
        <string>imagineui_scene</string>
        <key>patterns</key>
        <array>
            <dict>
                <key>include</key>
                <string>#main</string>
            </dict>
        </array>
        <key>scopeName</key>
        <string>source.imagineui_scene</string>
        <key>uuid</key>
        <string></string>
        <key>repository</key>
        <dict>
            <key>main</key>
            <dict>
                <key>patterns</key>
                <array>
                    <dict>
                        <key>match</key>
                        <string>${KEYWORDS_PATTERN}</string>
                        <key>name</key>
                        <string>keyword.imagineui_scene</string>
                    </dict>
                    <dict>
                        <key>begin</key>
                        <string>(\\&lt;)</string>
                        <key>beginCaptures</key>
                        <dict>
                            <key>1</key>
                            <dict>
                                <key>name</key>
                                <string>variable.imagineui_scene</string>
                            </dict>
                        </dict>
                        <key>contentName</key>
                        <string>variable.imagineui_scene</string>
                        <key>end</key>
                        <string>(\\&gt;)</string>
                        <key>endCaptures</key>
                        <dict>
                            <key>1</key>
                            <dict>
                                <key>name</key>
                                <string>variable.imagineui_scene</string>
                            </dict>
                        </dict>
                    </dict>
                    <dict>
                        <key>begin</key>
                        <string>(\\&quot;)</string>
                        <key>beginCaptures</key>
                        <dict>
                            <key>1</key>
                            <dict>
                                <key>name</key>
                                <string>text.imagineui_scene</string>
                            </dict>
                        </dict>
                        <key>contentName</key>
                        <string>text.imagineui_scene</string>
                        <key>end</key>
                        <string>(\\&quot;)</string>
                        <key>endCaptures</key>
                        <dict>
                            <key>1</key>
                            <dict>
                                <key>name</key>
                                <string>text.imagineui_scene</string>
                            </dict>
                        </dict>
                    </dict>
                    <dict>
                        <key>match</key>
                        <string>(//.*)</string>
                        <key>name</key>
                        <string>comment.imagineui_scene</string>
                    </dict>
                </array>
            </dict>
            <key>main__1</key>
            <dict>
                <key>patterns</key>
                <array>
                </array>
            </dict>
            <key>main__2</key>
            <dict>
                <key>patterns</key>
                <array>
                </array>
            </dict>
        </dict>
    </dict>
</plist>
`

const helpContent =
`Страница: Справка
Главный Блок: Каталог
    Кнопка
    Поле ввода поискового запроса с иконкой Search
    Список тем
    Тема включает в себя
        Заголовок
        <Ссылку на статью>

Примеры: // Примеры можно давать как по типу элемента, так и по переменной (как с CSS Selector'ами)
    Заголовок: "", ""
    <Ссылка на статью>: "", ""
    
Блок: Навигация
    Картинка Логотип
    Заголовок Справка
    Ссылка на чат с поддержкой
    
Навигация расположена в шапке
`

const loginContent =
`Экран: Авторизация
Главный Блок: Вход
    Картинка Логотип
    Заголовок
    Поле e-mail или номера телефона
    Поле ввода пароля
    Кнопка "Войти"
Блок: Сервис
    Одна строка
    Кнопка восстановления доступа
    Кнопка регистрации
    "2020 @vadkou"
Блок: Справка
    Два столбца
    Список тем
        включает в себя
            Заголовок
            <Ссылку на статью>


// Схема на русском языке для демонстрации заложенной возможности 
// локализованных вариаций языка по типу Gherkin
`

export async function liftOff(container: HTMLElement) {
    await loadWASM('https://unpkg.com/onigasm@2.2.4/lib/onigasm.wasm')

    monaco.languages.register({ id: "imagineui_scene" });
    const registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
            if (scopeName === 'source.imagineui_scene') {
                return {
                    format: 'plist',
                    content: syntax
                }
            } else {
                return {
                    format: 'plist',
                    content: syntax
                }
            }
        }
    })

    const grammars = new Map()
    grammars.set('imagineui_scene', 'source.imagineui_scene')
    // grammars.set('html', 'text.html.basic')
    // grammars.set('typescript', 'source.ts')

    await wireTmGrammars(monaco, registry, grammars)

    return monaco.editor.create(container, {
        value: loginContent,
        language: 'imagineui_scene' // this won't work out of the box, see below for more info
    })
}

export const Editor = ({onChange}: {onChange: (e: monaco.editor.IModelContentChangedEvent, editor: monaco.editor.IStandaloneCodeEditor) => void}) => {
    const container = useRef<HTMLDivElement>()
    useEffect(() => {
        if(container.current) {
            liftOff(container.current).then(editor => {
                editor.onDidChangeModelContent((ev) => onChange(ev, editor))
                editor.getModel()!.setValue(loginContent)
            })
        }
    }, [container])

    return <div ref={container}/>
}
