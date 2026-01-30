import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";
import { eslintConfigJavaScript } from "./common/javaScript.js";
import { eslintConfigSpecialized } from "./common/specialized.js";
import { eslintConfigTypeScript } from "./common/typeScript.js";
import { eslintConfigVite } from "./common/vite.js";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfigBase = [
	js.configs.recommended,
	eslintConfigPrettier,
	...eslintConfigJavaScript,
	...eslintConfigTypeScript,
	...eslintConfigVite,
	...eslintConfigSpecialized,
	{
		plugins: {
			turbo: turboPlugin,
		},
		rules: {
			"turbo/no-undeclared-env-vars": "warn",
		},
	},
	{
		plugins: {
			onlyWarn,
		},
	},
	{
		ignores: ["coverage/**", "dist/**", "*.config.mjs", "*.config.js"],
	},
];
