import pluginNext from "@next/eslint-plugin-next";
import { getEslintConfigReact } from "./common/react.js";
import { eslintConfigReactHooks } from "./common/reactHooks.js";
import { config as eslintReactInternalConfig } from "./react.js";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nextJsConfig = [
	...eslintReactInternalConfig,
	...getEslintConfigReact({ includeBrowserOptions: false }),
	{
		plugins: {
			"@next/next": pluginNext,
		},
		rules: {
			...pluginNext.configs.recommended.rules,
			...pluginNext.configs["core-web-vitals"].rules,
		},
	},
	...eslintConfigReactHooks,
];
