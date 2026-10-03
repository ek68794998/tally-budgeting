import { Select } from "@heroui/react";
import {
	buildAsset,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAssets } from "../hooks/store/useAssets";
import { useCategories } from "../hooks/store/useCategories";
import { buildSelection } from "../testing/heroUi";
import { TransactionsTableControls } from "./transactionsTableControls";

vi.mock("@heroui/react", async (importOriginal) => {
	const { withHeroUiStubs } = await import("../testing/heroUi.js");
	return withHeroUiStubs(importOriginal);
});
vi.mock("next/link", () => ({ default: vi.fn(() => null) }));
vi.mock("../hooks/store/useAssets", () => ({ useAssets: vi.fn() }));
vi.mock("../hooks/store/useCategories", () => ({ useCategories: vi.fn() }));
vi.mock("../transactionsPage/transactionsMenuDropdown", () => ({
	TransactionsMenuDropdown: vi.fn(() => <div data-testid="menu-dropdown" />),
}));

const renderControls = () => {
	const handlers = { onFilterChange: vi.fn(), onNewTransaction: vi.fn() };
	render(<TransactionsTableControls {...handlers} />);
	return handlers;
};

const flushDebounce = () => {
	act(() => {
		vi.advanceTimersByTime(500);
	});
};

describe("TransactionsTableControls", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.mocked(useAssets).mockReturnValue({
			assets: [
				buildAsset({ id: 2, name: "Savings" }),
				buildAsset({ id: 1, name: "Checking" }),
				buildAsset({ id: 3, name: "House", type: "fixed_asset" }),
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
			subcategories: [
				buildSubcategory({ id: 5, label: "Rent" }),
				buildSubcategory({ id: -1, label: "Uncategorized" }),
			],
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("debounces the merchant search into a filter", () => {
		const { onFilterChange } = renderControls();

		fireEvent.change(screen.getByPlaceholderText("Search merchants…"), {
			target: { value: "coffee" },
		});

		expect(onFilterChange).not.toHaveBeenCalledWith(
			"merchant like 'coffee'",
		);

		flushDebounce();

		expect(onFilterChange).toHaveBeenLastCalledWith(
			"merchant like 'coffee'",
		);
	});

	it("shows sorted account and category filters and applies them", () => {
		const { onFilterChange } = renderControls();

		expect(screen.queryByText("All Accounts")).toBeNull();

		const filterToggle = document
			.querySelector(".tabler-icon-filter")
			?.closest("button");

		if (filterToggle) {
			fireEvent.click(filterToggle);
		}

		const [accountSelect, categorySelect] = vi
			.mocked(Select)
			.mock.calls.slice(-2)
			.map(([props]) => props);

		expect([...(accountSelect?.items ?? [])]).toEqual([
			expect.objectContaining({ name: "Checking" }),
			expect.objectContaining({ name: "Savings" }),
		]);
		expect([...(categorySelect?.items ?? [])]).toEqual([
			expect.objectContaining({ label: "Uncategorized" }),
			expect.objectContaining({ label: "Rent" }),
		]);
		expect(accountSelect?.renderValue?.([])).toBe("All Accounts");

		act(() => {
			accountSelect?.onSelectionChange?.(buildSelection("1"));
			categorySelect?.onSelectionChange?.(buildSelection("5"));
		});
		flushDebounce();

		expect(onFilterChange).toHaveBeenLastCalledWith(
			"account in '1' and subcategory in '5'",
		);
	});

	it("offers adding a transaction or importing a file", () => {
		const { onNewTransaction } = renderControls();

		fireEvent.click(screen.getByText("New Transaction"));

		expect(onNewTransaction).toHaveBeenCalledOnce();
		expect(
			screen.getByText("Import File").closest("[data-href]"),
		).toHaveAttribute("data-href", "/transactions/upload");
		expect(screen.getByTestId("menu-dropdown")).toBeInTheDocument();
	});
});
