import { eslintConfigBase } from "./base.js";
import { getEslintConfigReact } from "./common/react.js";
import { eslintConfigReactHooks } from "./common/reactHooks.js";
import { eslintConfigTailwind } from "./common/tailwind.js";
import { eslintConfigTypeScript } from "./common/typeScript.js";

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
	...eslintConfigBase,
	...eslintConfigTypeScript,
	...eslintConfigTailwind,
	...getEslintConfigReact({ includeBrowserOptions: true }),
	...eslintConfigReactHooks,
];
