import { type Transaction } from "@tally/data-models/contracts/transaction";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { useTransactionRuleStore } from "@tally/utilities/state/transactionRule";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTransactionRules } from "./useTransactionRules";

vi.mock("@tally/utilities/state/transactionRule", () => ({
	useTransactionRuleStore: vi.fn(),
}));

const mockUseTransactionRuleStore = vi.mocked(useTransactionRuleStore);

const mockFetchTransactionRules = vi.fn();

const buildStore = (
	overrides: Partial<ReturnType<typeof useTransactionRuleStore>> = {},
) => ({
	error: null,
	fetch: mockFetchTransactionRules,
	isFetching: false,
	isHydrated: false,
	setTransactionRules: vi.fn(),
	transactionRules: [],
	...overrides,
});

describe("useTransactionRules", () => {
	it("calls fetchTransactionRules on mount when not hydrated and not fetching", () => {
		mockUseTransactionRuleStore.mockReturnValue(buildStore());

		renderHook(() => useTransactionRules());

		expect(mockFetchTransactionRules).toHaveBeenCalledOnce();
	});

	it.each([
		{ isFetching: false, isHydrated: true },
		{ isFetching: true, isHydrated: false },
		{ isFetching: true, isHydrated: true },
	])("does not call fetchTransactionRules when isHydrated=$isHydrated, isFetching=$isFetching", ({
		isFetching,
		isHydrated,
	}) => {
		mockFetchTransactionRules.mockClear();
		mockUseTransactionRuleStore.mockReturnValue(
			buildStore({ isFetching, isHydrated }),
		);

		renderHook(() => useTransactionRules());

		expect(mockFetchTransactionRules).not.toHaveBeenCalled();
	});

	it.each([
		{ expected: true, isFetching: false, isHydrated: false },
		{ expected: true, isFetching: true, isHydrated: true },
		{ expected: false, isFetching: false, isHydrated: true },
	])("returns isLoading=$expected when isHydrated=$isHydrated, isFetching=$isFetching", ({
		expected,
		isFetching,
		isHydrated,
	}) => {
		mockUseTransactionRuleStore.mockReturnValue(
			buildStore({ isFetching, isHydrated }),
		);

		const { result } = renderHook(() => useTransactionRules());

		expect(result.current.isLoading).toBe(expected);
	});

	it("returns transactionRules and error from store", () => {
		const transactionRules = [mockIncompleteObject<Transaction>({ id: 1 })];
		mockUseTransactionRuleStore.mockReturnValue(
			buildStore({ error: "oops", isHydrated: true, transactionRules }),
		);

		const { result } = renderHook(() => useTransactionRules());

		expect(result.current.transactionRules).toBe(transactionRules);
		expect(result.current.error).toBe("oops");
	});

	it("returns refetch as fetchTransactionRules from store", () => {
		mockUseTransactionRuleStore.mockReturnValue(
			buildStore({ isHydrated: true }),
		);

		const { result } = renderHook(() => useTransactionRules());

		expect(result.current.refetch).toBe(mockFetchTransactionRules);
	});
});
