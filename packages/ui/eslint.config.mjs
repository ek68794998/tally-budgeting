import { config as configBase } from "@tally/eslint-config/react-internal";

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
      "**/auth/loginForm.tsx",
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
    settings: {
      "better-tailwindcss": {
        entryPoint: `${import.meta.dirname}/src/tailwind.css`,
      },
    },
  },
];
