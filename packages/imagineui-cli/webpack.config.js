const fs = require("fs");
const path = require("path");
const spawn = require('child_process').spawn;
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const plugins = [];
const CopyWebpackPlugin = require('copy-webpack-plugin');

plugins.push({
    apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
            if(!fs.existsSync(resolveApp('./after-build.sh')))
                return;
            const child = spawn('sh', ['./after-build.sh']);
            child.stdout.on('data', function (data) {
                process.stdout.write(data);
            });
            child.stderr.on('data', function (data) {
                process.stderr.write(data);
            });
        });
    }
},
    new CopyWebpackPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, "../../node_modules/az/dicts"),
                to: 'dicts'
            }
        ]
    }));

module.exports = {
    entry: "./src/app.tsx",
    target: "node",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "build")
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [["@babel/preset-env", {
                            "targets": { "node": "current" },
                        }], "@babel/preset-typescript", "@babel/preset-react"]
                    }
                },
                exclude: /node_modules/,
                include: [
                    resolveApp("./src"),
                    resolveApp("../imagineui-core")
                ]
            }
        ]
    },
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
        alias: {
            "react": "preact/compat",
            "react-dom": "preact/compat"
        }
    },
    externals: {
        puppeteer: 'require("puppeteer")'
    },
    plugins
}
