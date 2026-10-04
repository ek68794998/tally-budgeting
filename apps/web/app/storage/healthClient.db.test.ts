import { beforeAll, describe, expect, it, vi } from "vitest";
import { pingDatabaseAsync } from "./healthClient";
import { createTestDatabaseHandle } from "./testing/testDatabase";

const testDatabase = createTestDatabaseHandle();

vi.mock("./database", () => ({
	getDatabase: () => testDatabase.database,
}));

describe("pingDatabaseAsync", () => {
	beforeAll(testDatabase.setUpAsync);

	it("resolves when the database responds", async () => {
		await expect(pingDatabaseAsync()).resolves.toBeUndefined();
	});
});
