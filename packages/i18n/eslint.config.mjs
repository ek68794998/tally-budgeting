import { eslintConfigBase as configBase } from "@tally/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default [
  ...configBase,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
