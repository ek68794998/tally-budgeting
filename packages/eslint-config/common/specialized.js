import jsdocPlugin from "eslint-plugin-jsdoc";
import preferArrowPlugin from "eslint-plugin-prefer-arrow";
import sortDestructureKeysPlugin from "eslint-plugin-sort-destructure-keys";
import typescriptSortKeysPlugin from "eslint-plugin-typescript-sort-keys";
import unicornPlugin from "eslint-plugin-unicorn";

/**
 * A custom ESLint configuration for specialized edge cases.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfigSpecialized = [
  {
    plugins: {
      jsdoc: jsdocPlugin,
      "prefer-arrow": preferArrowPlugin,
      "sort-destructure-keys": sortDestructureKeysPlugin,
      "typescript-sort-keys": typescriptSortKeysPlugin,
      unicorn: unicornPlugin,
    },
    rules: {
      "jsdoc/check-alignment": "error",
      "jsdoc/check-indentation": "error",
      "prefer-arrow/prefer-arrow-functions": "error",
      "sort-destructure-keys/sort-destructure-keys": [
        "error",
        {
          caseSensitive: false,
        },
      ],
      "typescript-sort-keys/interface": [
        "error",
        "asc",
        {
          caseSensitive: false,
          natural: true,
        },
      ],
      "unicorn/prefer-ternary": ["error", "only-single-line"],
    },
  },
];
