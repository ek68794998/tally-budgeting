import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		...configDefaults,
		coverage: {
			exclude: [
				...(configDefaults.coverage.exclude ?? []),
				"**/_*/**",
				"**/build/**",
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
				branches: 60,
				functions: 40,
				lines: 8,
				statements: 8,
			},
		},
		exclude: [...configDefaults.exclude, "**/build/**"],
		globals: true,
		include: ["**/(src|app)/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
	},
});
