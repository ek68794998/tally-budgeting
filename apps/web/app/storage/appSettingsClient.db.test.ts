import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { createTestDatabaseHandle } from "./testing/testDatabase";

const testDatabase = createTestDatabaseHandle();

vi.mock("./database", () => ({
	getDatabase: () => testDatabase.database,
}));

const importFreshClient = () => {
	vi.resetModules();
	return import("./appSettingsClient");
};

describe("getOrCreateSessionSecretAsync", () => {
	beforeAll(testDatabase.setUpAsync);
	beforeEach(testDatabase.resetAsync);
	afterAll(testDatabase.tearDownAsync);

	it("creates a secret once, then reuses it from cache and from the database", async () => {
		const first = await importFreshClient();
		const secret = await first.getOrCreateSessionSecretAsync();

		expect(Buffer.from(secret, "base64")).toHaveLength(32);
		await expect(first.getOrCreateSessionSecretAsync()).resolves.toBe(
			secret,
		);

		const freshModule = await importFreshClient();

		await expect(freshModule.getOrCreateSessionSecretAsync()).resolves.toBe(
			secret,
		);
	});
});
