import {
	buildAsset,
	buildSubcategory,
	buildTransaction,
} from "@tally/data-models/testing/fixtures";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { ModalDefaultTransaction } from "../common/modalDefault";
import { useDeleteTransaction } from "../hooks/api/useDeleteTransaction";
import { usePostTransaction } from "../hooks/api/usePostTransaction";
import { useAssets } from "../hooks/store/useAssets";
import { useCategories } from "../hooks/store/useCategories";
import { createQueryClientWrapper } from "../testing/queryClient";
import { useTransactionsTable } from "./useTransactionsTable";

vi.mock("../hooks/api/useDeleteTransaction", () => ({
	useDeleteTransaction: vi.fn(),
}));
vi.mock("../hooks/api/usePostTransaction", () => ({
	usePostTransaction: vi.fn(),
}));
vi.mock("../hooks/store/useAssets", () => ({ useAssets: vi.fn() }));
vi.mock("../hooks/store/useCategories", () => ({ useCategories: vi.fn() }));

const deleteTransactionAsync = vi.fn(() => Promise.resolve({ success: true }));
const postTransactionAsync = vi.fn(() => Promise.resolve({ success: true }));

const coffee = buildTransaction({ accountId: 1, id: 7, subcategoryId: 2 });
const rent = buildTransaction({
	amountCents: 1500_00,
	id: 8,
	merchant: "Rent",
});

let fetchMock: Mock<typeof fetch>;

const respondWith = (body: unknown) =>
	fetchMock.mockImplementation(() =>
		Promise.resolve(new Response(JSON.stringify(body))),
	);

const getRequestedParams = () => {
	const input = fetchMock.mock.lastCall?.[0];

	return new URL(typeof input === "string" ? input : "", "http://localhost")
		.searchParams;
};

const renderTableAsync = async () => {
	const { wrapper } = createQueryClientWrapper();
	const rendered = renderHook(useTransactionsTable, { wrapper });

	await waitFor(() => {
		expect(rendered.result.current.transactionsData).toHaveLength(2);
	});

	return rendered;
};

describe("useTransactionsTable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fetchMock = vi.fn<typeof fetch>();
		vi.stubGlobal("fetch", fetchMock);
		respondWith({ count: 31, success: true, transactions: [coffee, rent] });
		vi.mocked(useAssets).mockReturnValue({
			assets: [
				buildAsset({ id: 1, name: "Checking" }),
				buildAsset({ id: 2, name: "House", type: "fixed_asset" }),
			],
			error: null,
			isLoading: false,
			refetch: vi.fn(),
		});
		vi.mocked(useCategories).mockReturnValue({
			categories: [],
			error: null,
			isLoading: false,
			refetch: vi.fn(),
			subcategories: [buildSubcategory({ id: 2, label: "Coffee" })],
		});
		vi.mocked(useDeleteTransaction).mockReturnValue({
			deleteTransactionAsync,
		});
		vi.mocked(usePostTransaction).mockReturnValue({ postTransactionAsync });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("loads the first page sorted by date and converts it for display", async () => {
		const { result } = await renderTableAsync();

		expect(Object.fromEntries(getRequestedParams())).toEqual({
			direction: "descending",
			filter: "",
			limit: "15",
			page: "1",
			sortBy: "date",
		});
		expect(result.current.transactionsData[0]).toMatchObject({
			account: "Checking",
			id: 7,
			subcategory: "Coffee",
		});
		expect(result.current.pageCount).toBe(3);
		expect(result.current.selectedPage).toBe(1);
		expect(result.current.isLoading).toBe(false);
	});

	it.each([
		{ column: "merchant", expected: "merchant" },
		{ column: "subcategoryId", expected: "category" },
		{ column: "amountCents", expected: "amount" },
		{ column: "type", expected: "date" },
	])("requests sortBy=$expected when sorting by $column", async ({
		column,
		expected,
	}) => {
		const { result } = await renderTableAsync();

		act(() => {
			result.current.setSortDescriptor({
				column,
				direction: "ascending",
			});
			result.current.setFilterValue("  coffee  ");
			result.current.setPage(2);
		});

		await waitFor(() => {
			expect(getRequestedParams().get("sortBy")).toBe(expected);
		});
		expect(getRequestedParams().get("direction")).toBe("ascending");
		expect(getRequestedParams().get("filter")).toBe("coffee");
		expect(getRequestedParams().get("page")).toBe("2");
	});

	it("opens the editor for a new, existing, or duplicated transaction without changing the original", async () => {
		const { result } = await renderTableAsync();

		act(() => {
			result.current.startNewTransaction();
		});
		expect(result.current.activeTransaction).toBe(ModalDefaultTransaction);
		expect(result.current.editModalState.isOpen).toBe(true);

		act(() => {
			result.current.editTransaction(8);
		});
		expect(result.current.activeTransaction).toEqual(rent);

		act(() => {
			result.current.duplicateTransaction(7);
		});
		expect(result.current.activeTransaction).toEqual({
			...coffee,
			id: ModalDefaultTransaction.id,
		});

		act(() => {
			result.current.editModalState.onClose();
			result.current.editTransaction(7);
		});
		expect(result.current.activeTransaction?.id).toBe(7);

		act(() => {
			result.current.editTransaction(999);
			result.current.duplicateTransaction(999);
		});
		expect(result.current.activeTransaction?.id).toBe(7);
	});

	it("saves a transaction and reloads the page", async () => {
		const { result } = await renderTableAsync();
		const requestsBefore = fetchMock.mock.calls.length;

		await act(() => result.current.saveTransactionAsync(coffee));

		expect(postTransactionAsync).toHaveBeenCalledWith(coffee);
		await waitFor(() => {
			expect(fetchMock.mock.calls.length).toBeGreaterThan(requestsBefore);
		});
	});

	it("confirms deletion of the requested row and reloads the page", async () => {
		const { result } = await renderTableAsync();
		const [row] = result.current.transactionsData;

		await expect(result.current.confirmDeleteAsync()).rejects.toThrow(
			"Transaction to delete must be defined",
		);

		act(() => {
			if (row) {
				result.current.requestDelete(row);
			}
		});

		expect(result.current.transactionToDelete).toBe(row);
		expect(result.current.deleteModalState.isOpen).toBe(true);

		const requestsBefore = fetchMock.mock.calls.length;
		await act(() => result.current.confirmDeleteAsync());

		expect(deleteTransactionAsync).toHaveBeenCalledWith(7);
		await waitFor(() => {
			expect(fetchMock.mock.calls.length).toBeGreaterThan(requestsBefore);
		});
	});

	it("surfaces a malformed response as an error without retrying", async () => {
		respondWith({ unexpected: true });
		const { wrapper } = createQueryClientWrapper();

		const { result } = renderHook(useTransactionsTable, { wrapper });

		await waitFor(() => {
			expect(result.current.error).not.toBeNull();
		});
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(result.current.pageCount).toBe(0);
	});
});
