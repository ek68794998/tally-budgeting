import { configDefaults, defineConfig } from "vitest/config";

const { dirname } = import.meta;

export default defineConfig({
	test: {
		...configDefaults,
		coverage: {
			exclude: [
				...(configDefaults.coverage.exclude ?? []),
				"**/_*/**",
				"**/build/**",
				"**/coverage/**",
				"**/dist/**",
				"**/eslint-config/**",
				"**/node_modules/**",
				"**/testing/**",
				"**/typescript-config/**",
				"**/vitest-config/**",
			],
			provider: "v8",
			reporter: ["text", "html", "json"],
			thresholds: {
				// TODO (#13) Bring these up as we add tests.
				branches: 73,
				functions: 53,
				lines: 23,
				statements: 23,
			},
		},
		exclude: [...configDefaults.exclude, "**/build/**"],
		globals: true,
		include: ["**/(src|app)/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
		projects: [
			{
				test: {
					environment: "happy-dom",
					include: ["**/*.{test,spec}.{tsx,jsx}"],
					name: "unit-react",
					setupFiles: [
						`${dirname}/../../packages/vitest-config/src/i18n.setup.ts`,
						`${dirname}/../../packages/vitest-config/src/react.setup.ts`,
					],
				},
			},
			{
				test: {
					environment: "node",
					include: ["**/*.{test,spec}.{ts,js}"],
					name: "unit-ts",
				},
			},
		],
	},
});
