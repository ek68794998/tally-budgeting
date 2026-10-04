import pluginReactHooks from "eslint-plugin-react-hooks";

/**
 * A custom ESLint configuration for React Hooks.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfigReactHooks = [
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
    settings: { react: { version: "detect" } },
  },
];
