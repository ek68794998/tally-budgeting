import { type ActionItem } from "@tally/data-models/contracts/api/getBudgetSummary";
import {
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCategories } from "../../hooks/store/useCategories";
import { BudgetActionItemsSection } from "./budgetActionItemsSection";

const { warn } = vi.hoisted(() => ({ warn: vi.fn() }));

vi.mock("@tally/utilities/telemetry/telemetry", () => ({
	telemetry: () => ({ warn }),
}));
vi.mock("../../hooks/store/useCategories", () => ({ useCategories: vi.fn() }));
vi.mock("./budgetActionItemAboveAverage", () => ({
	BudgetActionItemAboveAverage: vi.fn(
		({ subcategory }: { subcategory: { label: string } }) => (
			<div data-testid="aboveAverage">{subcategory.label}</div>
		),
	),
}));
vi.mock("./budgetActionItemBudgetChange", () => ({
	BudgetActionItemBudgetChange: vi.fn(
		({ subcategory }: { subcategory: { label: string } }) => (
			<div data-testid="budgetChange">{subcategory.label}</div>
		),
	),
}));
vi.mock("./budgetActionItemOverBudget", () => ({
	BudgetActionItemOverBudget: vi.fn(
		({ subcategory }: { subcategory: { label: string } }) => (
			<div data-testid="overBudget">{subcategory.label}</div>
		),
	),
}));

const periodEnd = { month: 3, year: 2025 };

const items: ActionItem[] = [
	{
		budgeted: 1,
		frequency: 1,
		spent: 2,
		subcategoryId: 2,
		type: "overBudget",
	},
	{
		budgetTotal: 1,
		monthlyAverage: 1,
		remaining: 0,
		spentThisMonth: 2,
		spentThisPeriod: 2,
		subcategoryId: 1,
		type: "aboveAverage",
	},
	{
		budgeted: 1,
		currentSpent: 2,
		periodMonths: 1,
		previousSpent: 1,
		subcategoryId: 3,
		type: "budgetChange",
	},
	{
		budgeted: 1,
		frequency: 1,
		spent: 2,
		subcategoryId: 99,
		type: "overBudget",
	},
];

const mockCategories = (isLoading = false) =>
	vi.mocked(useCategories).mockReturnValue({
		categories: [buildCategory({ id: 1 })],
		error: null,
		isLoading,
		refetch: vi.fn(),
		subcategories: [
			buildSubcategory({ id: 1, label: "Books" }),
			buildSubcategory({ id: 2, label: "Apparel" }),
			buildSubcategory({ id: 3, label: "Coffee" }),
		],
	});

describe("BudgetActionItemsSection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCategories();
	});

	it("renders each item sorted by subcategory and skips unknown subcategories", () => {
		render(<BudgetActionItemsSection data={items} periodEnd={periodEnd} />);

		expect(
			screen
				.getAllByTestId(/^(aboveAverage|budgetChange|overBudget)$/u)
				.map((element) => [
					element.dataset.testid,
					element.textContent,
				]),
		).toEqual([
			["overBudget", "Apparel"],
			["aboveAverage", "Books"],
			["budgetChange", "Coffee"],
		]);
		expect(warn).toHaveBeenCalledWith("INVALID_CATEGORY", { id: 99 });
	});

	it("renders a spinner while categories load and nothing without items", () => {
		mockCategories(true);

		const { container, rerender } = render(
			<BudgetActionItemsSection data={items} periodEnd={periodEnd} />,
		);

		expect(screen.getByLabelText("Loading")).toBeInTheDocument();

		rerender(<BudgetActionItemsSection data={[]} periodEnd={periodEnd} />);

		expect(container).toBeEmptyDOMElement();
	});
});
