import { Kysely } from "kysely";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const importGetDatabaseAsync = async () => {
	const { getDatabase } = await import("./database");
	return getDatabase;
};

describe("getDatabase", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("throws when no connection string is configured", async () => {
		vi.stubEnv("POSTGRES_CONNECTION_STRING", undefined);
		const getDatabase = await importGetDatabaseAsync();

		expect(() => getDatabase()).toThrow(/POSTGRES_CONNECTION_STRING/);
	});

	it.each([
		{ poolMax: undefined },
		{ poolMax: "3" },
	])("creates a single shared instance (pool max $poolMax)", async ({
		poolMax,
	}) => {
		vi.stubEnv("POSTGRES_CONNECTION_STRING", "postgres://u:p@localhost/db");
		vi.stubEnv("POSTGRES_POOL_MAXIMUM", poolMax);
		const getDatabase = await importGetDatabaseAsync();

		const first = getDatabase();
		const second = getDatabase();

		expect(first).toBeInstanceOf(Kysely);
		expect(second).toBe(first);
	});
});
