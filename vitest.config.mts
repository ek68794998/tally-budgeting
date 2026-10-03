import { configDefaults, defineConfig } from "vitest/config";

const { dirname } = import.meta;

export default defineConfig({
	test: {
		...configDefaults,
		coverage: {
			exclude: [
				...(configDefaults.coverage.exclude ?? []),
				"**/_*/**",
				"**/app/layout.tsx",
				"**/app/styles/hero.ts",
				"**/build/**",
				"**/coverage/**",
				"**/dist/**",
				"**/eslint-config/**",
				"**/loading.tsx",
				"**/next.config.ts",
				"**/node_modules/**",
				"**/postcss.config.mjs",
				"**/route.ts",
				"**/testing/**",
				"**/typescript-config/**",
				"**/vitest-config/**",
			],
			provider: "v8",
			reporter: ["text", "text-summary", "html"],
			thresholds: {
				// TODO (#13) Bring these up as we add tests.
				branches: 88,
				functions: 76,
				lines: 43,
				statements: 43,
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
					exclude: [...configDefaults.exclude, "**/*.db.test.ts"],
					include: ["**/*.{test,spec}.{ts,js}"],
					name: "unit-ts",
				},
			},
			{
				test: {
					environment: "node",
					include: ["**/*.db.test.ts"],
					name: "integration-db",
					// Each PGlite instance holds ~800 MB, so run database tests one file at a time.
					pool: "forks",
					poolOptions: { forks: { singleFork: true } },
				},
			},
		],
	},
});
