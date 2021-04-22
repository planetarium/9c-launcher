const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const HtmlExternalsPlugin = require("html-webpack-externals-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { DefinePlugin, SourceMapDevToolPlugin } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const { version } = require("./package.json");

// const to avoid typos
const DEVELOPMENT = "development";
const PRODUCTION = "production";

function createRenderConfig(isDev) {
  return {
    context: path.join(__dirname, "src"),

    target: "electron-renderer", // any other target value makes react-hot-loader stop working

    resolve: {
      extensions: [".js", ".ts", ".tsx", ".scss", ".json"],
    },

    mode: isDev ? DEVELOPMENT : PRODUCTION,

    devtool: isDev ? "source-map" : "none",

    entry: {
      polyfill: "@babel/polyfill",
      render: "./renderer/render.tsx",
      staking: "./staking/staking.tsx",
    },

    output: {
      filename: isDev ? "[name].js" : "[name].[hash].js",
      path: path.join(__dirname, "dist"),
      publicPath: isDev ? "/" : undefined,
    },

    externals: {
      react: "React",
      "react-dom": "ReactDOM",
      "react-router-dom": "ReactRouterDOM",
      electron: "require('electron')",
    },

    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
            { loader: 'sass-loader' },
          ],
        },

        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-typescript",
                "@babel/preset-react",
                ["@babel/preset-env", {
                  "targets": {"chrome": "55"}
                }],
              ],
              plugins: [
                ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-proposal-class-properties", { loose: true }],
                "react-hot-loader/babel",
              ],
            },
          },
        },

        {
          test: /\.(svg|jpg|png|ttf)$/,
          exclude: /node_modules/,
          use: {
            loader: "url-loader",
            options: {},
          },
        },
      ],
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: "main.css",
      }),

      new HtmlPlugin({
        filename: "index.html",
        template: "index.html",
        chunks: ["render"], // respective JS files
      }),

      new HtmlPlugin({
        template: `staking.html`, // relative path to the HTML files
        filename: `staking.html`, // output HTML files
        chunks: ["staking"], // respective JS files
      }),

      new HtmlExternalsPlugin({
        cwpOptions: { context: path.join(__dirname, "node_modules") },
        externals: [
          {
            module: "react",
            global: "React",
            entry: isDev
              ? "umd/react.development.js"
              : "umd/react.production.min.js",
          },
          {
            module: "react-dom",
            global: "ReactDOM",
            entry: isDev
              ? "umd/react-dom.development.js"
              : "umd/react-dom.production.min.js",
          },
          {
            module: "react-router-dom",
            global: "ReactRouterDOM",
            entry: isDev
              ? "umd/react-router-dom.js"
              : "umd/react-router-dom.min.js",
          },
        ],
      }),

      new SourceMapDevToolPlugin({
        filename: "[file].map",
      }),
    ],

    devServer: isDev
      ? {
          contentBase: path.join(__dirname, "dist"),
          compress: true,
          port: 9000,
          historyApiFallback: true,
        }
      : undefined,
  };
}

function createMainConfig(isDev) {
  return {
    context: path.join(__dirname, "src"),

    target: "electron-main",

    mode: isDev ? DEVELOPMENT : PRODUCTION,

    entry: {
      main: "./main/main.ts",
      preload: "./preload/preload.ts",
    },

    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    },

    devtool: "source-map",

    output: {
      filename: "[name].js",
      path: path.join(__dirname, "dist"),
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-typescript", "@babel/preset-env"],
              plugins: [
                ["@babel/plugin-proposal-class-properties", { loose: true }],
              ],
            },
          },
        },
        {
          test: /\.(svg|jpg|png)$/,
          exclude: /node_modules/,
          use: {
            loader: "file-loader",
            options: {},
          },
        },
      ],
    },

    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ["main-process.*.js"],
      }),

      // inject this becaus the main process uses different logic for prod and dev.
      new DefinePlugin({
        ENVIRONMENT: JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION), // this variable name must match the one declared in the main process file.
      }),

      // electron-packager needs the package.json file. the "../" is because context is set to the ./src folder
      new CopyWebpackPlugin({
        patterns: [{ from: "package.json", to: "./", context: "../" }],
      }),
    ],
  };
}

module.exports = (env) => {
  // env variable is passed by webpack through the cli. see package.json scripts.
  const isDev = env.NODE_ENV === DEVELOPMENT;
  const { target, release } = env;

  const configFactory =
    target === "main" ? createMainConfig : createRenderConfig;
  const config = configFactory(isDev);
  if (release) {
    config.plugins.push(
      new SentryWebpackPlugin({
        // sentry-cli configuration
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "planetariumhq",
        project: "9c-launcher",
        // webpack specific configuration
        include: ".",
        ignore: ["node_modules", "webpack.config.js"],
        release: version,
        debug: true,
      })
    );
  }

  console.log(
    `\n##\n## BUILDING BUNDLE FOR: ${
      target === "main" ? "main process" : "render process"
    }\n## CONFIGURATION: ${
      isDev ? DEVELOPMENT : PRODUCTION
    }\n## VERSION: ${version}\n##\n`
  );

  return config;
};
