import {
	buildAsset,
	buildCategory,
	buildSubcategory,
	buildTransaction,
} from "@tally/data-models/testing/fixtures";
import { DateTime } from "luxon";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { AssetsClient } from "./assetsClient";
import { CategoriesClient } from "./categoriesClient";
import { SubcategoriesClient } from "./subcategoriesClient";
import { createTestDatabaseHandle } from "./testing/testDatabase";
import { TxnsClient } from "./txnsClient";
import { type CollectionParams } from "./types";

vi.mock("../auth/verifyRequest", () => ({
	assertAuthenticatedAsync: vi.fn(() => Promise.resolve()),
}));

const coffee = buildTransaction({
	accountId: 1,
	amountCents: 500,
	date: "2025-01-10T12:00:00.000Z",
	id: 1,
	merchant: "Alpha Coffee",
	notes: "latte",
	subcategoryId: 1,
});
const market = buildTransaction({
	amountCents: 1500,
	date: "2025-01-05T12:00:00.000Z",
	id: 2,
	merchant: "Beta Market",
	subcategoryId: 2,
	type: "credit",
});
const gas = buildTransaction({
	accountId: 1,
	amountCents: 1000,
	categoryId: -1,
	date: "2025-02-01T12:00:00.000Z",
	id: 3,
	merchant: "Gamma Gas",
	subcategoryId: -1,
});

const getIdsAsync = async (
	client: TxnsClient,
	collectionParams: Partial<CollectionParams>,
) => {
	const { data } = await client.getTransactionsAsync({
		collectionParams: { limit: 100, page: 1, ...collectionParams },
	});

	return data.map(({ id }) => id);
};

describe("TxnsClient", () => {
	const testDatabase = createTestDatabaseHandle();

	beforeAll(testDatabase.setUpAsync);
	beforeEach(testDatabase.resetAsync);
	afterAll(testDatabase.tearDownAsync);
	const createClient = () => new TxnsClient(testDatabase.database);

	beforeEach(async () => {
		const { database } = testDatabase;
		await new AssetsClient(database).insertAssetsAsync(
			buildAsset({ id: 0 }),
		);
		await new CategoriesClient(database).insertCategoriesAsync(
			buildCategory({ id: 0 }),
		);
		await new SubcategoriesClient(database).insertSubcategoriesAsync([
			buildSubcategory({ id: 0, label: "Rent" }),
			buildSubcategory({ id: 0, label: "Groceries" }),
		]);
		await createClient().insertTransactionsAsync(
			[coffee, market, gas].map((t) => ({ ...t, id: 0 })),
		);
	});

	describe("getTransactionsAsync", () => {
		it("returns every transaction joined with its category when given no options", async () => {
			await expect(
				createClient().getTransactionsAsync(),
			).resolves.toEqual({
				data: [coffee, market, gas],
				totalCount: 3,
			});
		});

		it.each([
			{ expected: [1], filter: "merchant like 'Coffee'" },
			{ expected: [2, 3], filter: "amount gt 600" },
			{ expected: [2, 3], filter: "amount ge 1000" },
			{ expected: [1], filter: "amount lt 1000" },
			{ expected: [1, 3], filter: "amount le 1000" },
			{ expected: [2, 3], filter: "amount ne 500" },
			{ expected: [1, 3], filter: "account eq 1" },
			{ expected: [1, 2], filter: "subcategory in 1,2" },
			{ expected: [1, 3], filter: "date ge 2025-01-08T00:00:00Z" },
			{ expected: [2], filter: "unknownField eq 2" },
			{ expected: [], filter: "merchant eq true" },
			// Expressions joined with `and` are currently combined with OR.
			{
				expected: [1, 2],
				filter: "merchant like 'Alpha' and merchant like 'Beta'",
			},
		])("filters with `$filter`", async ({ expected, filter }) => {
			await expect(
				getIdsAsync(createClient(), { filter }),
			).resolves.toEqual(expected);
		});

		it.each([
			{ direction: "descending", expected: [2, 3, 1], sortBy: "amount" },
			{ direction: "ascending", expected: [2, 1, 3], sortBy: "date" },
			{
				direction: "descending",
				expected: [3, 2, 1],
				sortBy: "merchant",
			},
			{ direction: "ascending", expected: [2, 1, 3], sortBy: "category" },
			{
				direction: "ascending",
				expected: [2, 1, 3],
				sortBy: "subcategory",
			},
			{ direction: "descending", expected: [3, 2, 1], sortBy: "unknown" },
		] as const)("sorts by $sortBy $direction", async ({
			direction,
			expected,
			sortBy,
		}) => {
			await expect(
				getIdsAsync(createClient(), { direction, sortBy }),
			).resolves.toEqual(expected);
		});

		it("paginates while reporting the unpaginated total", async () => {
			const result = await createClient().getTransactionsAsync({
				collectionParams: { limit: 2, page: 2 },
			});

			expect(result.data.map(({ id }) => id)).toEqual([3]);
			expect(result.totalCount).toBe(3);
		});
	});

	describe("getTransactionsInPeriodAsync", () => {
		it("returns transactions in the range, newest first", async () => {
			const transactions =
				await createClient().getTransactionsInPeriodAsync(
					DateTime.fromISO("2025-01-01T00:00:00Z"),
					DateTime.fromISO("2025-01-31T23:59:59Z"),
				);

			expect(transactions).toEqual([coffee, market]);
		});

		it("rejects an invalid date range", async () => {
			await expect(
				createClient().getTransactionsInPeriodAsync(
					DateTime.invalid("test"),
					DateTime.now(),
				),
			).rejects.toThrow("Invalid date range provided.");
		});
	});

	it("ignores an empty insert", async () => {
		const client = createClient();

		await client.insertTransactionsAsync([]);

		await expect(getIdsAsync(client, {})).resolves.toEqual([1, 2, 3]);
	});

	it("updates and deletes transactions", async () => {
		const client = createClient();

		await client.updateTransactionAsync({
			...coffee,
			amountCents: 999,
			notes: "",
		});
		await client.deleteTransactionAsync(2);

		const { data } = await client.getTransactionsAsync();

		expect(data).toEqual([{ ...coffee, amountCents: 999, notes: "" }, gas]);
	});
});
