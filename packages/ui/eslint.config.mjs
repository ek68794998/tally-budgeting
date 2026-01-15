import { config as configBase } from "@tally/eslint-config/react-internal";

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
