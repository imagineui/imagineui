const fs = require("fs");
const path = require("path");
const rewireBabelLoader = require("react-app-rewire-babel-loader");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
/* config-overrides.js */
module.exports = function override(config, env) {
    // TODO: Webpack WASM loader https://github.com/webpack/webpack/issues/7352
    config.module.rules.push({
        test: /\.xml$/i,
        use: 'raw-loader',
    },)
    config.resolve = {
        ...config.resolve,
        "alias": {
            "react": "preact/compat",
            "react-dom": "preact/compat"
        }
    }
    config.optimization.splitChunks = {
        cacheGroups: {
            default: false,
        },
    };

    config.optimization.runtimeChunk = false;
    return rewireBabelLoader.include(config, resolveApp("../imagineui-core"))
}
