const fs = require("fs");
const path = require("path");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        library: 'imagineuiCore',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-typescript",
                            ["@babel/preset-env", {
                            "targets": {
                                "node": "current",
                            },
                        }], "@babel/preset-react"]
                    }
                },
                exclude: /node_modules/,
                include: [
                    resolveApp("./src"),
                ]
            }
        ]
    },
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ]
    },
    optimization: {
        minimize: false
    },
    externals: {
        react: 'react'
    }
}
