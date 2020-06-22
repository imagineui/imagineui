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
We are in the process of packaging up ImagineUI as the CLI. 
You can try the alpha version by pulling sources from GitHub.
```
# You need to install Puppeteer globally first
npm install -g puppeteer

git clone git@github.com:imagineui/imagineui.git
cd imagineui
yarn
yarn start --input=%full-path-to-.scene% --outputDir=%full-path-to-folder%
```
Multiple --input paths are allowed for batch rendering (so that puppeteer only launches once)

Caveats: 
* On some systems `~` does not get substituted for `/home/%username%` yet
