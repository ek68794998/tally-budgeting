import { buildTransactionRule } from "@tally/data-models/testing/fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../../testing/routeTesting";
import { DeleteTransactionsRulesIdRouteAsync } from "./[id]/delete";
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

	it.each([
		{ id: 0, isList: true, method: client.insertTransactionRulesAsync },
		{ id: 2, isList: false, method: client.updateTransactionRuleAsync },
	])("POST saves a rule with id $id", async ({ id, isList, method }) => {
		const rule = buildTransactionRule({ id });

		const { status } = await callRouteAsync(
			PostTransactionsRulesRouteAsync,
			{
				body: { rule },
				method: "POST",
			},
		);

		expect(status).toBe(200);
		expect(method).toHaveBeenCalledExactlyOnceWith(isList ? [rule] : rule);
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
