const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { DefinePlugin, IgnorePlugin } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const { version } = require("./package.json");
const TerserPlugin = require("terser-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const child_process = require("child_process");

// const to avoid typos
const DEVELOPMENT = "development";
const PRODUCTION = "production";

const gitHash = child_process.execSync("git rev-parse HEAD", {
  encoding: "utf8",
});

/** @returns {import('webpack').Configuration} */
function createRenderConfig(isDev) {
  return {
    context: path.join(__dirname, "src"),

    target: "electron-renderer",

    resolve: {
      extensions: [".js", ".ts", ".tsx", ".scss", ".json"],
      alias: {
        root: __dirname,
        src: path.resolve(__dirname, "src"),
      },
      fallback: {
        os: false,
        fs: false,
      },
    },

    mode: isDev ? DEVELOPMENT : PRODUCTION,

    devtool: isDev && "eval-cheap-module-source-map",

    entry: {
      render: "./renderer/render.tsx",
    },

    output: {
      filename: isDev ? "[name].js" : "[name].[contenthash].js",
      assetModuleFilename: "assets/[hash][ext][query]",
      path: path.join(__dirname, "build"),
      publicPath: isDev ? "/" : undefined,
      clean: {
        keep: /^9c$|\.(?:exe|dll|json|app|so|debug)$|(?:9c_Data|MonoBleedingEdge|publish|9c.app)[\\\/]/,
      },
    },

    externalsPresets: {
      electronRenderer: true,
    },

    externals: {
      "spawn-sync": "require('child_process').spawnSync", // fix child-process-promise/cross
    },

    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" },
            { loader: "sass-loader" },
          ],
        },
        {
          test: /\.css$/,
          use: [{ loader: "style-loader" }, { loader: "css-loader" }],
        },
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false, // https://github.com/webpack/webpack/issues/11467
          },
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
                [
                  "@babel/preset-env",
                  {
                    targets: { electron: "20.0.1" },
                    useBuiltIns: "entry",
                    corejs: 3,
                  },
                ],
              ],
              plugins: [
                ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-proposal-class-properties", { loose: true }],
                ["@babel/plugin-proposal-private-methods", { loose: true }],
                [
                  "@babel/plugin-proposal-private-property-in-object",
                  { loose: true },
                ],
                isDev && "react-refresh/babel",
              ].filter(Boolean),
              sourceMaps: isDev,
            },
          },
        },

        {
          test: /\.(svg|jpg|png|ttf|webp|gif)$/,
          exclude: /node_modules/,
          type: "asset",
        },
      ],
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: "main.css",
      }),

      new DefinePlugin({
        GIT_HASH: JSON.stringify(gitHash),
        "process.type": JSON.stringify("renderer"),
      }),

      new HtmlPlugin({
        template: "index.html", // relative path to the HTML files
        filename: "index.html", // output HTML files
        chunks: ["render"], // respective JS files
      }),

      isDev && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),

    devServer: isDev
      ? {
          contentBase: path.join(__dirname, "build"),
          compress: true,
          port: 9000,
          historyApiFallback: true,
          hot: true,
        }
      : undefined,

    optimization: {
      minimize: !isDev,
      minimizer: [new TerserPlugin()],
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            minSize: 0,
            name: "vendors",
            reuseExistingChunk: true,
          },
          graphql: {
            test: /[\\/]src[\\/]generated[\\/]/,
            priority: -11,
            name: "graphql",
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
  };
}

/** @returns {import('webpack').Configuration} */
function createMainConfig(isDev) {
  return {
    context: path.join(__dirname, "src"),

    target: "electron-main",

    mode: isDev ? DEVELOPMENT : PRODUCTION,

    entry: {
      main: "./main/main.ts",
    },

    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
      alias: {
        root: __dirname,
        src: path.resolve(__dirname, "src"),
      },
    },

    ignoreWarnings: [
      /^Critical dependency:/, // fix keyv and got using weird tricks to avoid webpack
    ],

    devtool: "source-map",

    externalsPresets: {
      node: true,
      electronMain: true,
    },

    externals: {
      "spawn-sync": "require('child_process').spawnSync", // fix child-process-promise/cross
    },

    output: {
      filename: "[name].js",
      path: path.join(__dirname, "build"),
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
                [
                  "@babel/preset-env",
                  {
                    targets: { node: "16.15.0" },
                    useBuiltIns: "entry",
                    corejs: 3,
                  },
                ],
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", { loose: true }],
                ["@babel/plugin-proposal-private-methods", { loose: true }],
                [
                  "@babel/plugin-proposal-private-property-in-object",
                  { loose: true },
                ],
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
        {
          test: /\.node$/,
          loader: "node-loader",
        },
      ],
    },

    stats: {
      warningsFilter: [
        /Can't resolve '(@planetarium|\.)\/check-free-space-/, // Rust bindings tries to import everything by default
      ],
    },

    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ["main-process.*.js"],
      }),

      // inject this becaus the main process uses different logic for prod and dev.
      new DefinePlugin({
        ENVIRONMENT: JSON.stringify(isDev ? DEVELOPMENT : PRODUCTION), // this variable name must match the one declared in the main process file.
        "process.type": JSON.stringify("browser"),
      }),

      // electron-packager needs the package.json file. the "../" is because context is set to the ./src folder
      new CopyWebpackPlugin({
        patterns: [{ from: "package.json", to: "./", context: "../" }],
      }),

      new IgnorePlugin({
        resourceRegExp: /^(utf-8-validate|bufferutil)/, // fix intended missing dependencies
      }),
    ],

    optimization: {
      minimize: !isDev,
      minimizer: [new TerserPlugin()],
    },
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
