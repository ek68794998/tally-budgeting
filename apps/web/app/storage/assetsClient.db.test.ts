import { buildAsset } from "@tally/data-models/testing/fixtures";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { assertAuthenticatedAsync } from "../auth/verifyRequest";
import { AssetsClient } from "./assetsClient";
import { createTestDatabaseHandle } from "./testing/testDatabase";

vi.mock("../auth/verifyRequest", () => ({
	assertAuthenticatedAsync: vi.fn(() => Promise.resolve()),
}));

describe("AssetsClient", () => {
	const testDatabase = createTestDatabaseHandle();

	beforeAll(testDatabase.setUpAsync);
	beforeEach(testDatabase.resetAsync);
	afterAll(testDatabase.tearDownAsync);
	const createClient = () => new AssetsClient(testDatabase.database);

	it("inserts single and multiple assets and reads them back in id order", async () => {
		const client = createClient();

		await client.insertAssetsAsync(buildAsset({ id: 0, name: "Checking" }));
		await client.insertAssetsAsync([
			buildAsset({
				id: 0,
				name: "House",
				type: "fixed_asset",
				valueCents: 5,
			}),
			buildAsset({
				id: 0,
				name: "Card",
				provider: "chase",
				type: "short_term_liability",
			}),
		]);

		await expect(client.getAssetsAsync()).resolves.toEqual([
			buildAsset({ id: 1, name: "Checking" }),
			buildAsset({
				id: 2,
				name: "House",
				type: "fixed_asset",
				valueCents: 5,
			}),
			buildAsset({
				id: 3,
				name: "Card",
				provider: "chase",
				type: "short_term_liability",
			}),
		]);
	});

	it("updates and deletes an asset by id", async () => {
		const client = createClient();
		await client.insertAssetsAsync([
			buildAsset({ id: 0, name: "A" }),
			buildAsset({ id: 0, name: "B" }),
		]);

		await client.updateAssetAsync(
			buildAsset({ active: false, id: 1, name: "A2", valueCents: 42 }),
		);
		await client.deleteAssetAsync(2);

		await expect(client.getAssetsAsync()).resolves.toEqual([
			buildAsset({ active: false, id: 1, name: "A2", valueCents: 42 }),
		]);
	});

	it("does not touch the database when the caller is not authenticated", async () => {
		const client = createClient();
		vi.mocked(assertAuthenticatedAsync).mockRejectedValueOnce(
			new Error("Authentication required."),
		);

		await expect(client.insertAssetsAsync(buildAsset())).rejects.toThrow(
			"Authentication required.",
		);
		await expect(client.getAssetsAsync()).resolves.toEqual([]);
	});
});
