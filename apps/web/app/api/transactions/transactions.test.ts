import { buildTransaction } from "@tally/data-models/testing/fixtures";
import { withoutId } from "@tally/utilities/object/withoutId";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../testing/routeTesting";
import { DeleteTransactionsIdRouteAsync } from "./[id]/delete";
import { PutTransactionsIdRouteAsync } from "./[id]/put";
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

	it("POST creates a transaction from its fields", async () => {
		const transaction = withoutId(buildTransaction());

		const { status } = await callRouteAsync(PostTransactionsRouteAsync, {
			body: { transaction },
			method: "POST",
		});

		expect(status).toBe(201);
		expect(client.insertTransactionsAsync).toHaveBeenCalledExactlyOnceWith([
			transaction,
		]);
	});

	it.each([
		{ transaction: buildTransaction() },
	])("POST rejects %o", async (body) => {
		const { status } = await callRouteAsync(PostTransactionsRouteAsync, {
			body,
			method: "POST",
		});

		expect(status).toBe(400);
		expect(client.insertTransactionsAsync).not.toHaveBeenCalled();
	});

	it.each([
		{ expectedStatus: 200, wasUpdated: true },
		{ expectedStatus: 404, wasUpdated: false },
	])("PUT updates a transaction by route id with status $expectedStatus", async ({
		expectedStatus,
		wasUpdated,
	}) => {
		client.updateTransactionAsync.mockResolvedValue(wasUpdated);
		const transaction = withoutId(buildTransaction());

		const { status } = await callRouteAsync(PutTransactionsIdRouteAsync, {
			body: { transaction },
			method: "PUT",
			params: { id: "12" },
		});

		expect(status).toBe(expectedStatus);
		expect(client.updateTransactionAsync).toHaveBeenCalledExactlyOnceWith({
			...transaction,
			id: 12,
		});
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
