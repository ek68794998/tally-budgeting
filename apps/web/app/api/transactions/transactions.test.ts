import { buildTransaction } from "@tally/data-models/testing/fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../testing/routeTesting";
import { DeleteTransactionsIdRouteAsync } from "./[id]/delete";
import { GetTransactionsRouteAsync } from "./get";
import { PostTransactionsRouteAsync } from "./post";

vi.mock(
	"../../storage/txnsClient",
	async () => (await import("../testing/routeTesting")).storageModules.txns,
);
vi.mock(
	"../../auth/verifyRequest",
	async () =>
		(await import("../testing/routeTesting")).authenticatedRequestModule,
);
vi.mock(
	"../../telemetry/telemetry",
	async () => (await import("../testing/routeTesting")).silentTelemetryModule,
);

const { txns: client } = storageMocks;

describe("transactions routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GET passes collection params through and links to the next page", async () => {
		client.getTransactionsAsync.mockResolvedValue({
			data: [buildTransaction()],
			totalCount: 41,
		});

		const { json, status } = await callRouteAsync(
			GetTransactionsRouteAsync,
			{
				url: "http://localhost/api/transactions?page=2&limit=20&sortBy=amount&direction=descending&filter=amount%20gt%205",
			},
		);

		expect(status).toBe(200);
		expect(client.getTransactionsAsync).toHaveBeenCalledWith({
			collectionParams: {
				direction: "descending",
				filter: "amount gt 5",
				limit: 20,
				page: 2,
				sortBy: "amount",
			},
		});
		expect(json).toEqual({
			count: 41,
			nextLink:
				"http://localhost/api/transactions?page=3&limit=20&sortBy=amount&direction=descending&filter=amount+gt+5",
			success: true,
			transactions: [buildTransaction()],
		});
	});

	it.each([
		"sortBy=notes",
		"limit=1000",
		"limit=0",
		"limit=abc",
		"page=abc",
		"page=0",
		"page=1.5",
	])("GET rejects invalid query parameters: %s", async (query) => {
		const { json, status } = await callRouteAsync(
			GetTransactionsRouteAsync,
			{
				url: `http://localhost/api/transactions?${query}`,
			},
		);

		expect(status).toBe(400);
		expect(json).toMatchObject({
			error: { code: "invalidQueryParameters" },
		});
	});

	it.each([
		{ id: 0, isList: true, method: client.insertTransactionsAsync },
		{ id: 9, isList: false, method: client.updateTransactionAsync },
	])("POST saves a transaction with id $id", async ({
		id,
		isList,
		method,
	}) => {
		const transaction = buildTransaction({ id });

		const { status } = await callRouteAsync(PostTransactionsRouteAsync, {
			body: { transaction },
			method: "POST",
		});

		expect(status).toBe(200);
		expect(method).toHaveBeenCalledExactlyOnceWith(
			isList ? [transaction] : transaction,
		);
	});

	it("DELETE removes the transaction with the route id", async () => {
		const { status } = await callRouteAsync(
			DeleteTransactionsIdRouteAsync,
			{
				method: "DELETE",
				params: { id: "3" },
			},
		);

		expect(status).toBe(204);
		expect(client.deleteTransactionAsync).toHaveBeenCalledWith(3);
	});
});
