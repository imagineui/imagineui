# ImagineUI
ImagineUI is a tool that supports developing wireframes in a localized human-readable format.

[Try it out](https://imagineui.github.io)

:warning: Early alpha. Things may break. :wrench: :construction:

Please provide feedback and vote for features on the [issues page](https://github.com/imagineui/imagineui/issues)

To get involved you can also refer to the [thought process doc](https://imagineui.github.io/en/docs/grokking/thought-process/) (quazi-white paper) and share your thoughts at [vadkou@wave909.com](mailto:vadkou@wave909.com)

## Usage

### Editor
Full demo: https://imagineui.github.io

Latest core (`master` branch, used for CLI): https://imagineui.netlify.app/

### CLI
```bash
npx imagineui-cli --input=%full-path-to-.scene% --outputDir=%full-path-to-folder%
```
Multiple --input paths are allowed for batch rendering (so that `puppeteer` only launches once)
To speed up launching the `npx` command it is advised to install `imagineui-cli` globally, so that `puppeteer` is only downloaded once.
```bash
npm install -g imagineui-cli
```

Caveats: 
* On some systems `~` does not get substituted for `/home/%username%` yet
