const rendererConfig = require('../webpack.config.js');
const path = require('path');

module.exports = {
  "core": {
    "builder": "webpack5",
  },
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-actions",
    "@storybook/addon-essentials",
    "@storybook/preset-scss",
    "storybook-addon-apollo-client",
  ],
  webpackFinal: async (config, {configType}) => {
    const custom = rendererConfig({
      NODE_ENV: process.env.NODE_ENV || "development",
      target: "renderer",
      release: false,
    });

    config.resolve.modules = [
      path.resolve(__dirname, ".."),
      "node_modules",
    ]
    config.resolve.alias.electron = require.resolve("../__tests__/ipcMock.ts");
    config.resolve.alias['tmp-promise'] = require.resolve("../__tests__/tmpMock.ts");
    return { ...config, module: { ...config.module, rules: custom.module.rules } };
  }
}
