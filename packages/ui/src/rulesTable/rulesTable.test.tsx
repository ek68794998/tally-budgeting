import { type useDisclosure } from "@heroui/react";
import {
	buildSubcategory,
	buildTransactionRule,
} from "@tally/data-models/testing/fixtures";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConfirmationModal } from "../common/confirmationModal";
import { useCategories } from "../hooks/store/useCategories";
import { useRulesTable } from "./hooks/useRulesTable";
import { RuleEditModal } from "./ruleEditModal";
import { RuleRowDropdown } from "./ruleRowDropdown";
import { RulesTable } from "./rulesTable";
import { RulesTableControls } from "./rulesTableControls";

vi.mock("./hooks/useRulesTable", async (importOriginal) => ({
	...(await importOriginal<typeof import("./hooks/useRulesTable.js")>()),
	useRulesTable: vi.fn(),
}));
vi.mock("../hooks/store/useCategories", () => ({ useCategories: vi.fn() }));
vi.mock("../common/confirmationModal", () => ({
	ConfirmationModal: vi.fn(() => <div data-testid="confirmation-modal" />),
}));
vi.mock("./ruleEditModal", () => ({
	RuleEditModal: vi.fn(() => <div data-testid="rule-edit-modal" />),
}));
vi.mock("./ruleRowDropdown", () => ({
	RuleRowDropdown: vi.fn(() => <div data-testid="row-dropdown" />),
}));
vi.mock("./rulesTableControls", () => ({
	RulesTableControls: vi.fn(() => <div data-testid="table-controls" />),
}));

type TableState = ReturnType<typeof useRulesTable>;

const modalState = mockIncompleteObject<ReturnType<typeof useDisclosure>>({
	isOpen: false,
});

const coffee = buildTransactionRule({
	id: 1,
	matcher: { flags: "i", pattern: "coffee" },
	merchantName: "Coffee",
	subcategoryId: 2,
});

const buildState = (overrides: Partial<TableState> = {}): TableState => ({
	activeRule: coffee,
	bulkDeleteModalState: modalState,
	bulkDeleteRules: [coffee],
	deleteModalState: modalState,
	displayedRules: [coffee],
	editModalState: modalState,
	filterValue: "",
	handleBulkDeleteAsync: vi.fn(),
	handleDeleteAsync: vi.fn(() => Promise.resolve()),
	handleEdit: vi.fn(),
	handleNewRule: vi.fn(),
	handleReorderAsync: vi.fn(() => Promise.resolve()),
	handleSaveAsync: vi.fn(),
	isLoading: false,
	openBulkDeleteModal: vi.fn(),
	openDeleteModal: vi.fn(),
	selection: new Set(),
	setFilterValue: vi.fn(),
	setSelection: vi.fn(),
	...overrides,
});

const getConfirmationProps = () =>
	vi.mocked(ConfirmationModal).mock.calls.map(([props]) => props);

describe("RulesTable", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useCategories).mockReturnValue({
			categories: [],
			error: null,
			isLoading: false,
			refetch: vi.fn(),
			subcategories: [buildSubcategory({ id: 2, label: "Dining" })],
		});
	});

	it("renders each rule with its category and expression and wires the controls", () => {
		const state = buildState();
		vi.mocked(useRulesTable).mockReturnValue(state);

		render(<RulesTable />);

		expect(screen.getByText("Coffee")).toBeInTheDocument();
		expect(screen.getByText("Dining")).toBeInTheDocument();
		expect(screen.getByText("/coffee/i")).toBeInTheDocument();
		expect(vi.mocked(RulesTableControls).mock.lastCall?.[0]).toEqual({
			displayedCount: 1,
			onDelete: state.openBulkDeleteModal,
			onFilterChange: state.setFilterValue,
			onNewRule: state.handleNewRule,
			selectedRules: state.selection,
		});
		expect(vi.mocked(RuleEditModal).mock.lastCall?.[0]).toMatchObject({
			onSaveAsync: state.handleSaveAsync,
			rule: coffee,
		});
	});

	it("wires each row's actions to the table state", () => {
		const state = buildState();
		vi.mocked(useRulesTable).mockReturnValue(state);

		render(<RulesTable />);

		const rowActions = vi.mocked(RuleRowDropdown).mock.lastCall?.[0];
		rowActions?.onDelete();
		rowActions?.onEdit();
		rowActions?.onReorder("top");

		expect(state.openDeleteModal).toHaveBeenCalledWith(coffee);
		expect(state.handleEdit).toHaveBeenCalledWith(coffee);
		expect(state.handleReorderAsync).toHaveBeenCalledWith(coffee, "top");
	});

	it.each([
		{ expectedTitle: "Delete All (1)", selection: "all" as const },
		{ expectedTitle: "Delete Selected (1)", selection: new Set([1]) },
	])("titles bulk deletion as '$expectedTitle'", ({
		expectedTitle,
		selection,
	}) => {
		vi.mocked(useRulesTable).mockReturnValue(buildState({ selection }));

		render(<RulesTable />);

		expect(getConfirmationProps()[0]?.title).toBe(expectedTitle);
	});

	it("deletes the active rule on confirmation and requires one", async () => {
		const state = buildState();
		vi.mocked(useRulesTable).mockReturnValue(state);

		render(<RulesTable />);
		await getConfirmationProps()[1]?.onConfirmAsync();

		expect(state.handleDeleteAsync).toHaveBeenCalledWith(coffee);

		vi.clearAllMocks();
		vi.mocked(useRulesTable).mockReturnValue(
			buildState({ activeRule: null }),
		);
		render(<RulesTable />);

		await expect(
			getConfirmationProps()[1]?.onConfirmAsync(),
		).rejects.toThrow("Active rule must be defined");
	});
});
