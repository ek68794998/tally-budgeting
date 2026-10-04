import { buildTransactionRule } from "@tally/data-models/testing/fixtures";
import { withoutId } from "@tally/utilities/object/withoutId";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../../testing/routeTesting";
import { DeleteTransactionsRulesIdRouteAsync } from "./[id]/delete";
import { PutTransactionsRulesIdRouteAsync } from "./[id]/put";
import { GetTransactionsRulesRouteAsync } from "./get";
import { PatchTransactionsRulesOrderRouteAsync } from "./order/patch";
import { PostTransactionsRulesRouteAsync } from "./post";

vi.mock(
	"../../../storage/txnRulesClient",
	async () =>
		(await import("../../testing/routeTesting")).storageModules.txnRules,
);
vi.mock(
	"../../../auth/verifyRequest",
	async () =>
		(await import("../../testing/routeTesting")).authenticatedRequestModule,
);
vi.mock(
	"../../../telemetry/telemetry",
	async () =>
		(await import("../../testing/routeTesting")).silentTelemetryModule,
);

const { txnRules: client } = storageMocks;

describe("transaction rule routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GET returns every rule", async () => {
		client.getTransactionRulesAsync.mockResolvedValue([
			buildTransactionRule(),
		]);

		const { json, status } = await callRouteAsync(
			GetTransactionsRulesRouteAsync,
		);

		expect(status).toBe(200);
		expect(json).toEqual({
			success: true,
			transactionRules: [buildTransactionRule()],
		});
	});

	it("POST creates a rule from its fields", async () => {
		const rule = withoutId(buildTransactionRule());

		const { status } = await callRouteAsync(
			PostTransactionsRulesRouteAsync,
			{
				body: { rule },
				method: "POST",
			},
		);

		expect(status).toBe(201);
		expect(
			client.insertTransactionRulesAsync,
		).toHaveBeenCalledExactlyOnceWith([rule]);
	});

	it.each([
		{ rule: buildTransactionRule() },
	])("POST rejects %o", async (body) => {
		const { status } = await callRouteAsync(
			PostTransactionsRulesRouteAsync,
			{
				body,
				method: "POST",
			},
		);

		expect(status).toBe(400);
		expect(client.insertTransactionRulesAsync).not.toHaveBeenCalled();
	});

	it.each([
		{ expectedStatus: 200, wasUpdated: true },
		{ expectedStatus: 404, wasUpdated: false },
	])("PUT updates a rule by route id with status $expectedStatus", async ({
		expectedStatus,
		wasUpdated,
	}) => {
		client.updateTransactionRuleAsync.mockResolvedValue(wasUpdated);
		const rule = withoutId(buildTransactionRule());

		const { status } = await callRouteAsync(
			PutTransactionsRulesIdRouteAsync,
			{
				body: { rule },
				method: "PUT",
				params: { id: "12" },
			},
		);

		expect(status).toBe(expectedStatus);
		expect(
			client.updateTransactionRuleAsync,
		).toHaveBeenCalledExactlyOnceWith({
			...rule,
			id: 12,
		});
	});

	it("DELETE removes the rule with the route id", async () => {
		const { status } = await callRouteAsync(
			DeleteTransactionsRulesIdRouteAsync,
			{ method: "DELETE", params: { id: "5" } },
		);

		expect(status).toBe(204);
		expect(client.deleteTransactionRuleAsync).toHaveBeenCalledWith(5);
	});

	it("PATCH reorders rules", async () => {
		const { status } = await callRouteAsync(
			PatchTransactionsRulesOrderRouteAsync,
			{ body: { ruleIds: [3, 1, 2] }, method: "PATCH" },
		);

		expect(status).toBe(200);
		expect(client.updateTransactionRulesOrderAsync).toHaveBeenCalledWith([
			3, 1, 2,
		]);
	});
});
