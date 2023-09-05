const rendererConfig = require("../webpack.config.ts");
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
    config.resolve.alias.child_process = [
      path.resolve(__dirname, "childProcessMock.js"),
    ];
    config.resolve.modules = [path.resolve(__dirname, ".."), "node_modules"];
    config.resolve.alias.electron = require.resolve("../__tests__/ipcMock.ts");
    config.resolve.alias["tmp-promise"] = require.resolve(
      "../__tests__/tmpMock.ts",
    );
    config.resolve.fallback = {
      fs: false,
      assert: false,
      buffer: false,
      console: false,
      constants: false,
      crypto: false,
      domain: false,
      events: false,
      http: false,
      https: false,
      os: false,
      path: false,
      punycode: false,
      process: false,
      querystring: false,
      stream: false,
      string_decoder: false,
      sys: false,
      timers: false,
      tty: false,
      url: false,
      util: false,
      vm: false,
      zlib: false,
      "node:fs": false,
      "node:stream": false,
      "node:fs/promises": false,
      "node:os": false,
      "node:path": false,
      "node:readline": false,
    };
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
