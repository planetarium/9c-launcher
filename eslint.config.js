const path = require("path");

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: "module",
  },
  rules: {
    "jsx-quotes": [1, "prefer-double"],
    "@typescript-eslint/no-empty-function": ["off"],
    "@typescript-eslint/no-use-before-define": ["warn"],
  },
  plugins: ["@typescript-eslint", "prettier"],
};
