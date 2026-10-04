import { nextJsConfig } from "@tally/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    settings: {
      "better-tailwindcss": {
        entryPoint: `${import.meta.dirname}/app/styles/globals.css`,
      },
    },
  },
];
