import js from "@eslint/js";

/**
 * A custom ESLint configuration for JavaScript.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfigJavaScript = [
	{
		...js.configs.recommended,
		rules: {
			...js.configs.recommended.rules,
			"array-bracket-spacing": ["error", "never"],
			"arrow-body-style": "error",
			"arrow-parens": ["error", "always"],
			"block-spacing": "error",
			"brace-style": ["error", "1tbs"],
			camelcase: "error",
			"comma-dangle": [
				"error",
				{
					arrays: "always-multiline",
					exports: "always-multiline",
					functions: "always-multiline",
					imports: "always-multiline",
					objects: "always-multiline",
				},
			],
			"comma-spacing": "error",
			complexity: "off",
			"constructor-super": "error",
			curly: "error",
			"default-case": "error",
			"dot-notation": "error",
			"eol-last": ["error", "always"],
			eqeqeq: ["error", "smart"],
			"func-call-spacing": ["error", "never"],
			"guard-for-in": "error",
			"id-blacklist": ["error", "any", "Undefined", "undefined"],
			"id-match": "error",
			"key-spacing": "error",
			"keyword-spacing": "error",
			"lines-between-class-members": [
				"error",
				"always",
				{
					exceptAfterSingleLine: true,
				},
			],
			"max-classes-per-file": ["error", 1],
			"max-len": [
				"error",
				{
					code: 120,
					ignorePattern:
						"(^[ \\t]*// eslint-|[`\"'](\\)*;|\\})?$|/.+/)",
					ignoreStrings: true,
					ignoreTemplateLiterals: true,
					ignoreUrls: true,
				},
			],
			"new-parens": "error",
			"no-bitwise": "error",
			"no-caller": "error",
			"no-case-declarations": "off", // Handled by TypeScript.
			"no-cond-assign": "error",
			"no-console": [
				"error",
				{
					allow: ["debug", "info", "warn", "error"],
				},
			],
			"no-debugger": "error",
			"no-duplicate-case": "error",
			"no-empty": "error",
			"no-eval": "error",
			"no-extra-bind": "error",
			"no-fallthrough": "error",
			"no-invalid-this": "off",
			"no-mixed-spaces-and-tabs": "off", // Handled by Biome.
			"no-multi-spaces": "error",
			"no-multiple-empty-lines": [
				"error",
				{
					max: 1,
					maxBOF: 0,
				},
			],
			"no-new-func": "error",
			"no-new-wrappers": "error",
			"no-redeclare": "error",
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							message:
								"Cross-project imports must be made using package names, not source folders.",
							regex: "\\.\\./.*/src(/.*)?",
						},
						{
							group: ["@bps/testing"],
							message:
								"Non-test files may not import from testing libraries.",
						},
						{
							group: ["**/__test__/**"],
							message:
								"Non-test files may not import from testing libraries.",
						},
					],
				},
			],
			"no-restricted-syntax": [
				"error",
				{
					message:
						"Type must be inferred or specified at variable declaration.",
					selector:
						"VariableDeclaration[kind = 'let'] > VariableDeclarator[init = null]:not([id.typeAnnotation])",
				},
				{
					message:
						"useEffect() should not be called with a single argument as this will cause it to run on every render.",
					selector:
						"CallExpression[callee.name='useEffect'][arguments.length = 1]",
				},
				{
					message:
						"z.any() should not be used. Instead, use z.unknown() or a strict type definition.",
					selector:
						"MemberExpression[object.name = 'z'][property.name = 'any']",
				},
			],
			"no-return-await": "error",
			"no-sequences": "error",
			"no-shadow": "off",
			"no-sparse-arrays": "error",
			"no-template-curly-in-string": "error",
			"no-throw-literal": "error",
			"no-trailing-spaces": "error",
			"no-undef": "off",
			"no-undef-init": "error",
			"no-unsafe-finally": "error",
			"no-unused-expressions": [
				"error",
				{
					allowShortCircuit: true,
					allowTernary: true,
				},
			],
			"no-unused-labels": "error",
			"no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					ignoreRestSiblings: true,
					varsIgnorePattern: "^_",
				},
			],
			"no-var": "error",
			"object-curly-spacing": ["error", "always"],
			"object-shorthand": "error",
			"one-var": ["error", "never"],
			"padding-line-between-statements": [
				"error",
				{
					blankLine: "always",
					next: "class",
					prev: "*",
				},
				{
					blankLine: "always",
					next: "for",
					prev: "*",
				},
				{
					blankLine: "always",
					next: "function",
					prev: "*",
				},
				{
					blankLine: "always",
					next: "if",
					prev: "*",
				},
				{
					blankLine: "always",
					next: "*",
					prev: "multiline-block-like",
				},
				{
					blankLine: "always",
					next: "try",
					prev: "*",
				},
			],
			"prefer-const": "error",
			"prefer-object-spread": "error",
			"quote-props": ["error", "as-needed"],
			radix: "error",
			"sort-keys": [
				"error",
				"asc",
				{
					allowLineSeparatedGroups: true,
					caseSensitive: false,
					natural: true,
				},
			],
			"space-before-function-paren": [
				"error",
				{
					anonymous: "always",
					asyncArrow: "always",
					named: "never",
				},
			],
			"space-in-parens": ["error", "never"],
			"spaced-comment": "error",
			"use-isnan": "error",
			"valid-typeof": "off",
		},
	},
];
