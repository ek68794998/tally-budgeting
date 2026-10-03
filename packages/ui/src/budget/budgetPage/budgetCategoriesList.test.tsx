import {
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCategories } from "../../hooks/store/useCategories";
import { BudgetCategoriesList } from "./budgetCategoriesList";

vi.mock("../../hooks/store/useCategories", () => ({ useCategories: vi.fn() }));
vi.mock("./budgetSubcategorySpend", () => ({
	BudgetSubcategorySpend: vi.fn(() => <div data-testid="spend" />),
}));

const breakdown = (subcategoryId: number, currentPeriodSpent: number) => ({
	budgetAmountCents: 0,
	budgetFrequency: 1,
	budgetType: "expense" as const,
	currentPeriodSpent,
	previousPeriodSpent: 0,
	subcategoryId,
});

describe("BudgetCategoriesList", () => {
	beforeEach(() => {
		vi.mocked(useCategories).mockReturnValue({
			categories: [
				buildCategory({ id: 1, label: "Housing" }),
				buildCategory({ id: 2, label: "Food" }),
				buildCategory({ id: 3, label: "Unused" }),
			],
			error: null,
			isLoading: false,
			refetch: vi.fn(),
			subcategories: [
				buildSubcategory({ categoryId: 1, id: 1, label: "Rent" }),
				buildSubcategory({
					budget: {
						amountCents: 100_00,
						frequency: 1,
						type: "expense",
					},
					categoryId: 2,
					id: 2,
					label: "Groceries",
				}),
				buildSubcategory({
					budget: { amountCents: 0, frequency: 1, type: "expense" },
					categoryId: 3,
					id: 3,
					label: "Nothing",
				}),
			],
		});
	});

	it("summarizes categories with budgets or spending and hides empty ones", () => {
		render(
			<BudgetCategoriesList
				data={[breakdown(1, 500), breakdown(2, 150)]}
				periodEnd={{ month: 3, year: 2025 }}
			/>,
		);

		expect(screen.getByText("Housing")).toBeInTheDocument();
		expect(screen.getByText("On target")).toBeInTheDocument();
		expect(screen.getByText("Food")).toBeInTheDocument();
		expect(screen.getByText("1 over budget")).toBeInTheDocument();
		expect(screen.queryByText("Unused")).toBeNull();
	});
});
