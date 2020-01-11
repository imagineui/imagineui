const fs = require("fs");
const path = require("path");
const rewireBabelLoader = require("react-app-rewire-babel-loader");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
/* config-overrides.js */
module.exports = function override(config, env) {
    config.resolve = {
        ...config.resolve,
        "alias": {
            "react": "preact/compat",
            "react-dom": "preact/compat"
        }
    }
    return rewireBabelLoader.include(config, resolveApp("../imagineui-core"))
}
