import { buildSubcategory } from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BudgetSubcategorySpend } from "./budgetSubcategorySpend";

describe("BudgetSubcategorySpend", () => {
	it.each([
		{ amountCents: 100_00, amountPaid: 150, overBudgetChips: 1 },
		{ amountCents: 100_00, amountPaid: 50, overBudgetChips: 0 },
		{ amountCents: 0, amountPaid: 50, overBudgetChips: 0 },
	])("shows $overBudgetChips over-budget chip(s) for $amountPaid of $amountCents cents", ({
		amountCents,
		amountPaid,
		overBudgetChips,
	}) => {
		render(
			<BudgetSubcategorySpend
				amountPaid={amountPaid}
				periodEnd={{ month: 3, year: 2025 }}
				subcategory={buildSubcategory({
					budget: { amountCents, frequency: 1, type: "expense" },
					description: "Clothes and shoes",
					label: "Apparel",
				})}
			/>,
		);

		expect(screen.getByText("Apparel")).toBeInTheDocument();
		expect(screen.queryAllByText(/over budget/iu)).toHaveLength(
			overBudgetChips,
		);
	});
});
