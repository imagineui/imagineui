const fs = require("fs");
const path = require("path");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

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
        extensions: [ ".tsx", ".ts", ".js" ]
    },
    externals: {
        puppeteer: 'require("puppeteer")'
    },
}
