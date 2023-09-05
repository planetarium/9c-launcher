const rendererConfig = require("../webpack.config.ts");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-actions",
    "@storybook/addon-essentials",
    "@storybook/preset-scss",
    "storybook-addon-apollo-client",
  ],
  webpackFinal: async (config, { configType }) => {
    const custom = rendererConfig({
      NODE_ENV: process.env.NODE_ENV || "development",
      target: "renderer",
      release: false,
    });

    config.externals = {
      ...config.externals,
      "node:fs/promises": "commonjs2 node:fs/promises",
      "node:os": "commonjs2 node:os",
      "node:path": "commonjs2 node:path",
      "node:readline": "commonjs2 node:readline",
      "node:stream": "commonjs2 node:stream",
    };

    config.plugins = [...config.plugins, new NodePolyfillPlugin()];

    config.resolve.alias.child_process = [
      path.resolve(__dirname, "childProcessMock.js"),
    ];
    config.resolve.modules = [path.resolve(__dirname, ".."), "node_modules"];
    config.resolve.alias.electron = require.resolve("../__tests__/ipcMock.ts");
    config.resolve.alias["tmp-promise"] = require.resolve(
      "../__tests__/tmpMock.ts",
    );

    return {
      ...config,
      module: { ...config.module, rules: custom.module.rules },
    };
  },

  framework: {
    name: "@storybook/react-webpack5",
    options: {
      fastRefresh: true,
    },
  },

  docs: {
    autodocs: true,
  },
};
