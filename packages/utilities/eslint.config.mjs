import { eslintConfigBase as configBase } from "@tally/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default [
  ...configBase,
  {
    rules: {
      "no-restricted-globals": [
        "error",
        {
          message:
            "Use apiFetch from @tally/utilities/routing/apiFetch so that expired sessions are detected.",
          name: "fetch",
        },
      ],
    },
  },
  {
    files: [
      "**/routing/apiFetch.ts",
      "**/telemetry/batching/batchingLogger.ts",
    ],
    rules: {
      "no-restricted-globals": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
