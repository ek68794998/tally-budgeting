import pluginReact from "eslint-plugin-react";
import globals from "globals";

/**
 * A custom ESLint configuration for React.
 *
 * @param {{ includeBrowserOptions: boolean }} fileExtension
 * @returns {import("eslint").Linter.Config[]}
 */
export const getEslintConfigReact = ({ includeBrowserOptions }) => [
	{
		...pluginReact.configs.flat.recommended,
		languageOptions: {
			...pluginReact.configs.flat.recommended.languageOptions,
			globals: {
				...globals.serviceworker,
				...(includeBrowserOptions ? globals.browser : {}),
			},
		},
		rules: {
			...pluginReact.configs.flat.recommended.rules,
			"react/boolean-prop-naming": "error",
			"react/jsx-boolean-value": ["error", "always"],
			"react/jsx-no-literals": "error",
			"react/jsx-sort-props": ["error", { ignoreCase: true }],
			"react/prop-types": "off",
		},
	},
];
