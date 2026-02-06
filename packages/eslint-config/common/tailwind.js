import tailwindPlugin from "eslint-plugin-tailwindcss";

/**
 * A custom ESLint configuration for Tailwind CSS.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfigTailwind = [
	...tailwindPlugin.configs["flat/recommended"],
	{
		rules: {
			"tailwindcss/no-custom-classname": [
				"error",
				{
					whitelist: [
						// Hero UI
						"^(text|bg|border|ring|shadow|outline|divide|placeholder|caret|accent)-(default|background|divider)(-[0-9]+)?(/[0-9]+)?$",
						"^(text|bg|border|ring|shadow|outline|divide|placeholder|caret|accent)-(primary|secondary|danger|warning|success)-[0-9]+(/[0-9]+)?$",
					],
				},
			],
		},
		settings: {
			tailwindcss: {
				callees: ["twMerge"],
				config: {
					content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
					plugins: [],
					theme: {
						extend: {},
					},
					variants: {},
				},
			},
		},
	},
];
