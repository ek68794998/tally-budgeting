import { configDefaults, defineConfig } from "vitest/config";

const { dirname } = import.meta;

const setupFileDirectory = `${dirname}/../../packages/vitest-config/src`;
const globalSetupFile = `${setupFileDirectory}/global.setup.ts`;
const testExclude = [...configDefaults.exclude, "**/build/**", "**/dist/**"];

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
        branches: 94,
        functions: 95,
        lines: 98,
        statements: 98,
      },
    },
    exclude: testExclude,
    globals: true,
    include: ["**/(src|app)/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    projects: [
      {
        // The web app's tsconfig preserves JSX for Next.js, which would otherwise compile to the classic runtime.
        esbuild: { jsx: "automatic" },
        test: {
          environment: "happy-dom",
          exclude: testExclude,
          include: ["**/*.{test,spec}.{tsx,jsx}"],
          name: "unit-react",
          setupFiles: [
            globalSetupFile,
            `${setupFileDirectory}/i18n.setup.ts`,
            `${setupFileDirectory}/react.setup.ts`,
          ],
        },
      },
      {
        test: {
          environment: "node",
          exclude: [...testExclude, "**/*.db.test.ts"],
          include: ["**/*.{test,spec}.{ts,js}"],
          name: "unit-ts",
          setupFiles: [globalSetupFile],
        },
      },
      {
        test: {
          environment: "node",
          exclude: testExclude,
          globalSetup: ["apps/web/app/storage/testing/pgliteGlobalSetup.ts"],
          include: ["**/*.db.test.ts"],
          // PGlite memory is only returned to the OS when its process exits,
          // so database test files run one at a time, each in its own fork.
          maxWorkers: 1,
          name: "integration-db",
          pool: "forks",
          sequence: { groupOrder: 1 },
          setupFiles: [globalSetupFile],
        },
      },
    ],
  },
});
