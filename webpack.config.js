const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const HtmlExternalsPlugin = require("html-webpack-externals-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DefinePlugin = require("webpack").DefinePlugin;
const CopyWebpackPlugin = require("copy-webpack-plugin");



// const to avoid typos 
const DEVELOPMENT = "development";
const PRODUCTION = "production";


function createRenderConfig(isDev) {
    return {

        context: path.join(__dirname, "src"),

        target: "web", // any other target value makes react-hot-loader stop working

        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json"]
        },

        mode: isDev ? DEVELOPMENT : PRODUCTION,

        devtool: isDev ? "source-map" : "none",

        entry: {
            "polyfill": "@babel/polyfill",
            "render-process": "./render-process.tsx"
        },

        output: {
            filename: isDev ? "[name].js" : "[name].[hash].js",
            path: path.join(__dirname, "dist")
        },

        externals: {
            "react": "React",
            "react-dom": "ReactDOM",
            "react-router-dom": "ReactRouterDOM",
            "fs": "require('fs')" // we must add node native functions as externals to be able to use them. see ./src/views/FooView.tsx.
        },

        module: {
            rules: [

                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: isDev
                            }
                        },
                        "css-loader",
                        "sass-loader"
                    ]
                },

                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-typescript",
                                "@babel/preset-react",
                                "@babel/preset-env"
                            ],
                            plugins: [
                                "@babel/plugin-proposal-class-properties",
                                "react-hot-loader/babel"
                            ]
                        }
                    }
                },

            ]
        },

        plugins: [

            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ["!main-process.*.js"] // config for electron-main deletes this file
            }),

            new MiniCssExtractPlugin({
                filename: "main.css"
            }),

            new HtmlPlugin({
                filename: "index.html",
                template: "index.html",
                cache: true,
            }),

            new HtmlExternalsPlugin({
                cwpOptions: { context: path.join(__dirname, "node_modules") },
                externals: [
                    {
                        module: "react",
                        global: "React",
                        entry: isDev ? "umd/react.development.js" : "umd/react.production.min.js"
                    },
                    {
                        module: "react-dom",
                        global: "ReactDOM",
                        entry: isDev ? "umd/react-dom.development.js" : "umd/react-dom.production.min.js"
                    },
                    {
                        module: "react-router-dom",
                        global: "ReactRouterDOM",
                        entry: isDev ? "umd/react-router-dom.js" : "umd/react-router-dom.min.js"
                    },
                ]
            }),

        ],

        devServer: isDev ? {
            contentBase: path.join(__dirname, "dist"),
            compress: true,
            port: 9000
        } : undefined
    };
}


function createMainConfig(isDev) {
    return {

        context: path.join(__dirname, "src"),

        target: "electron-main",

        mode: isDev ? DEVELOPMENT : PRODUCTION,

        entry: {
            "main-process": "./main-process.ts"
        },

        output: {
            filename: "[name].js",
            path: path.join(__dirname, "dist")
        },

        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-typescript",
                                "@babel/preset-env",
                            ],
                        }
                    }
                }
            ]
        },

        plugins: [

            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ["main-process.*.js"]
            }),

            // inject this becaus the main process uses different logic for prod and dev.
            new DefinePlugin({
                "ENVIRONMENT": JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION) // this variable name must match the one declared in the main process file.
            }),

            // electron-packager needs the package.json file. the "../" is because context is set to the ./src folder
            new CopyWebpackPlugin({
                patterns: [
                    {from: "package.json", to: "./", context:"../"}
                ]
            })
        ]
    };
}



module.exports = function (env) {

    // env variable is passed by webpack through the cli. see package.json scripts.
    const isDev = env.NODE_ENV == DEVELOPMENT;
    const target = env.target;

    const configFactory = target == "main" ? createMainConfig : createRenderConfig;
    const config = configFactory(isDev);

    console.log(
        "\n##\n## BUILDING BUNDLE FOR: " + (target == "main" ? "main process" : "render process") +
        "\n## CONFIGURATION: " + (isDev ? DEVELOPMENT : PRODUCTION) +
        "\n##\n"
    );

    return config;

};
