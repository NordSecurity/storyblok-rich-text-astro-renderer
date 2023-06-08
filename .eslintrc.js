module.exports = {
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:astro/recommended",
  ],
  globals: {
    globalThis: true,
  },
  overrides: [
    {
      files: ["*.astro"],
      plugins: ["astro"],
      env: {
        node: true,
        "astro/astro": true,
        es2020: true,
      },
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
        sourceType: "module",
      },
    },
  ],
  ignorePatterns: "dist/",
};
