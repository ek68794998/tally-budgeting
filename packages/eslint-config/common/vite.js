import vitestPlugin from "eslint-plugin-vitest";

/**
 * A custom ESLint configuration for Vite & Vitest.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const eslintConfigVite = [
	{
		plugins: { vitest: vitestPlugin },
		rules: {
			"vitest/require-top-level-describe": "error",
		},
	},
];
