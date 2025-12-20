import tailwindPlugin from "eslint-plugin-tailwindcss";

/**
 * A custom ESLint configuration for Tailwind CSS.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfigTailwind = [
	...tailwindPlugin.configs["flat/recommended"],
	{
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
