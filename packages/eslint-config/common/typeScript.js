import tseslint from "typescript-eslint";
import { getNamingConventionsRule } from "../helpers.js";

/**
 * A custom ESLint configuration for TypeScript.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfigTypeScript = [
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		rules: {
			"@typescript-eslint/adjacent-overload-signatures": "error",
			"@typescript-eslint/array-type": "error",
			"@typescript-eslint/consistent-type-assertions": [
				"error",
				{
					assertionStyle: "never",
				},
			],
			"@typescript-eslint/consistent-type-definitions": "error",
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					disallowTypeAnnotations: false,
					fixStyle: "inline-type-imports",
				},
			],
			"@typescript-eslint/explicit-function-return-type": "off", // For static inference of return types.
			"@typescript-eslint/explicit-member-accessibility": [
				"error",
				{
					accessibility: "explicit",
				},
			],
			"@typescript-eslint/member-ordering": ["error"],
			"@typescript-eslint/naming-convention":
				getNamingConventionsRule("ts"),
			"@typescript-eslint/no-empty-function": "error",
			"@typescript-eslint/no-empty-interface": "error",
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-misused-new": "error",
			"@typescript-eslint/no-namespace": "error",
			"@typescript-eslint/no-non-null-assertion": "error",
			"@typescript-eslint/no-parameter-properties": "off",
			"@typescript-eslint/no-shadow": [
				"error",
				{
					allow: ["fetch", "Request", "Response"],
					builtinGlobals: false,
					hoist: "all",
				},
			],
			"@typescript-eslint/no-this-alias": "error",
			"@typescript-eslint/no-unnecessary-condition": "error",
			"@typescript-eslint/no-unused-vars": "off", // Handled by JS/Biome.
			"@typescript-eslint/no-use-before-define": "off",
			"@typescript-eslint/no-var-requires": "error",
			"@typescript-eslint/prefer-for-of": "error",
			"@typescript-eslint/prefer-function-type": "error",
			"@typescript-eslint/prefer-namespace-keyword": "error",
			"@typescript-eslint/triple-slash-reference": "error",
			"@typescript-eslint/typedef": [
				"error",
				{
					propertyDeclaration: true,
				},
			],
			"@typescript-eslint/unified-signatures": "error",
		},
	},
	{
		files: ["**/*.d.ts"],
		rules: {
			"@typescript-eslint/naming-convention":
				getNamingConventionsRule("d.ts"),
			"no-unused-vars": "off", // Allow unexported declarations.
			"spaced-comment": ["error", "always", { markers: ["/"] }],
		},
	},
	{
		files: ["**/*.tsx"],
		rules: {
			"@typescript-eslint/naming-convention":
				getNamingConventionsRule("tsx"),
		},
	},
];
