import { type TransactionRule } from "@tally/data-models/contracts/transactionRule";
import { buildTransactionRule } from "@tally/data-models/testing/fixtures";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDeleteTransactionRule } from "../../hooks/api/useDeleteTransactionRule";
import { usePatchTransactionRulesReorder } from "../../hooks/api/usePatchTransactionRulesReorder";
import { usePostTransactionRule } from "../../hooks/api/usePostTransactionRule";
import { useTransactionRules } from "../../hooks/store/useTransactionRules";
import { getRuleRowKey, useRulesTable } from "./useRulesTable";

vi.mock("../../hooks/api/useDeleteTransactionRule", () => ({
	useDeleteTransactionRule: vi.fn(),
}));
vi.mock("../../hooks/api/usePatchTransactionRulesReorder", () => ({
	usePatchTransactionRulesReorder: vi.fn(),
}));
vi.mock("../../hooks/api/usePostTransactionRule", () => ({
	usePostTransactionRule: vi.fn(),
}));
vi.mock("../../hooks/store/useTransactionRules", () => ({
	useTransactionRules: vi.fn(),
}));

type MutationResult = Promise<false | { success: boolean }>;

const deleteTransactionRuleAsync = vi.fn<(id: number) => MutationResult>();
const patchTransactionRulesReorderAsync =
	vi.fn<(ids: number[]) => MutationResult>();
const postTransactionRuleAsync =
	vi.fn<(rule: TransactionRule) => MutationResult>();
const refetch = vi.fn(() => Promise.resolve());

const coffee = buildTransactionRule({
	id: 1,
	merchantName: "Coffee",
	priority: 2,
});
const groceries = buildTransactionRule({
	id: 2,
	merchantName: "Groceries",
	priority: 0,
});
const gas = buildTransactionRule({ id: 3, merchantName: "Gas", priority: 1 });

const renderRulesTable = () => renderHook(() => useRulesTable());

describe("useRulesTable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		deleteTransactionRuleAsync.mockResolvedValue({ success: true });
		patchTransactionRulesReorderAsync.mockResolvedValue({ success: true });
		postTransactionRuleAsync.mockResolvedValue({ success: true });
		vi.mocked(useDeleteTransactionRule).mockReturnValue({
			deleteTransactionRuleAsync,
		});
		vi.mocked(usePatchTransactionRulesReorder).mockReturnValue({
			patchTransactionRulesReorderAsync,
		});
		vi.mocked(usePostTransactionRule).mockReturnValue({
			postTransactionRuleAsync,
		});
		vi.mocked(useTransactionRules).mockReturnValue({
			error: null,
			isLoading: false,
			refetch,
			transactionRules: [coffee, groceries, gas],
		});
	});

	it("sorts rules by priority and filters them by merchant name", () => {
		const { result } = renderRulesTable();

		expect(result.current.displayedRules).toEqual([groceries, gas, coffee]);

		act(() => {
			result.current.setFilterValue("co");
		});

		expect(result.current.displayedRules).toEqual([coffee]);
	});

	it("opens the edit modal for an existing or a new rule", () => {
		const { result } = renderRulesTable();

		act(() => {
			result.current.handleEdit(coffee);
		});

		expect(result.current.activeRule).toBe(coffee);
		expect(result.current.editModalState.isOpen).toBe(true);

		act(() => {
			result.current.handleNewRule();
		});

		expect(result.current.activeRule).toMatchObject({
			id: -1,
			matcher: { flags: "i", pattern: "" },
		});
	});

	it.each([
		{
			act: (table: ReturnType<typeof useRulesTable>) =>
				table.handleDeleteAsync(coffee),
			expectCall: () =>
				expect(deleteTransactionRuleAsync).toHaveBeenCalledWith(1),
			name: "deletes",
		},
		{
			act: (table: ReturnType<typeof useRulesTable>) =>
				table.handleSaveAsync(coffee),
			expectCall: () =>
				expect(postTransactionRuleAsync).toHaveBeenCalledWith(coffee),
			name: "saves",
		},
		{
			act: (table: ReturnType<typeof useRulesTable>) =>
				table.handleReorderAsync(coffee, "top"),
			expectCall: () =>
				expect(patchTransactionRulesReorderAsync).toHaveBeenCalledWith([
					1, 2, 3,
				]),
			name: "reorders",
		},
	])("$name a rule, refetches, and clears the active rule", async ({
		act: runAsync,
		expectCall,
	}) => {
		const { result } = renderRulesTable();

		act(() => {
			result.current.openDeleteModal(coffee);
		});

		expect(result.current.deleteModalState.isOpen).toBe(true);

		await act(() => runAsync(result.current));

		expectCall();
		expect(refetch).toHaveBeenCalledOnce();
		expect(result.current.activeRule).toBeNull();
	});

	it.each([
		{ expected: [groceries, gas, coffee], selection: "all" as const },
		{ expected: [gas], selection: new Set([getRuleRowKey(gas)]) },
	])("bulk deletes the selected rules ($selection)", async ({
		expected,
		selection,
	}) => {
		const { result } = renderRulesTable();

		act(() => {
			result.current.openBulkDeleteModal(selection);
		});

		expect(result.current.bulkDeleteRules).toEqual(expected);
		expect(result.current.bulkDeleteModalState.isOpen).toBe(true);

		await act(() => result.current.handleBulkDeleteAsync());

		expect(deleteTransactionRuleAsync.mock.calls).toEqual(
			expected.map(({ id }) => [id]),
		);
		expect(result.current.bulkDeleteRules).toEqual([]);
		expect(result.current.selection).toEqual(new Set());
	});

	it("keeps failed rules selected and reports the failure after a bulk delete", async () => {
		deleteTransactionRuleAsync.mockImplementation((id) =>
			id === gas.id
				? Promise.reject(new Error("nope"))
				: Promise.resolve({ success: true }),
		);
		const { result } = renderRulesTable();

		act(() => {
			result.current.openBulkDeleteModal("all");
		});

		await act(async () => {
			await expect(
				result.current.handleBulkDeleteAsync(),
			).rejects.toThrow("Failed to delete 1 of 3 rules");
		});

		expect(refetch).toHaveBeenCalledOnce();
		expect(result.current.bulkDeleteRules).toEqual([gas]);
		expect(result.current.selection).toEqual(new Set([getRuleRowKey(gas)]));
	});
});
