import { buildTransactionRule } from "@tally/data-models/testing/fixtures";
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
import { TxnRulesClient } from "./txnRulesClient";

vi.mock("../auth/verifyRequest", () => ({
	assertAuthenticatedAsync: vi.fn(() => Promise.resolve()),
}));

const buildRule = (id: number, priority: number) =>
	buildTransactionRule({
		id,
		matcher: { flags: "i", pattern: `rule-${id}` },
		priority,
		subcategoryId: -1,
	});

describe("TxnRulesClient", () => {
	const testDatabase = createTestDatabaseHandle();

	beforeAll(testDatabase.setUpAsync);
	beforeEach(testDatabase.resetAsync);
	afterAll(testDatabase.tearDownAsync);
	const createClient = () => new TxnRulesClient(testDatabase.database);

	it("reads rules ordered by priority, then id", async () => {
		const client = createClient();

		await client.insertTransactionRulesAsync(buildRule(0, 5));
		await client.insertTransactionRulesAsync([
			buildRule(0, 1),
			buildRule(0, 1),
		]);

		await expect(client.getTransactionRulesAsync()).resolves.toEqual([
			{ ...buildRule(2, 1), matcher: { flags: "i", pattern: "rule-0" } },
			{ ...buildRule(3, 1), matcher: { flags: "i", pattern: "rule-0" } },
			{ ...buildRule(1, 5), matcher: { flags: "i", pattern: "rule-0" } },
		]);
	});

	it("updates and deletes rules", async () => {
		const client = createClient();
		await client.insertTransactionRulesAsync([
			buildRule(0, 0),
			buildRule(0, 1),
		]);

		await client.updateTransactionRuleAsync({
			...buildRule(1, 0),
			active: false,
			merchantName: "Renamed",
		});
		await client.deleteTransactionRuleAsync(2);

		await expect(client.getTransactionRulesAsync()).resolves.toEqual([
			{ ...buildRule(1, 0), active: false, merchantName: "Renamed" },
		]);
	});

	it("reorders rules by the given ids, ignoring ids that no longer exist", async () => {
		const client = createClient();
		await client.insertTransactionRulesAsync([
			buildRule(0, 0),
			buildRule(0, 1),
			buildRule(0, 2),
		]);

		await client.updateTransactionRulesOrderAsync([3, 99, 1, 2]);

		const rules = await client.getTransactionRulesAsync();

		expect(rules.map(({ id, priority }) => ({ id, priority }))).toEqual([
			{ id: 3, priority: 0 },
			{ id: 1, priority: 2 },
			{ id: 2, priority: 3 },
		]);
	});
});
