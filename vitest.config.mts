import { configDefaults, defineConfig } from "vitest/config";

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
			],
			provider: "v8",
			reporter: ["text", "html", "json"],
			thresholds: {
				// TODO (#13) Bring these up as we add tests.
				branches: 65,
				functions: 45,
				lines: 10,
				statements: 10,
			},
		},
		exclude: [...configDefaults.exclude, "**/build/**"],
		globals: true,
		include: ["**/(src|app)/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
	},
});
