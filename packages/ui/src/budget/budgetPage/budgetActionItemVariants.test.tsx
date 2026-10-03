import {
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BudgetActionItemAboveAverage } from "./budgetActionItemAboveAverage";
import { BudgetActionItemBudgetChange } from "./budgetActionItemBudgetChange";
import { BudgetActionItemCell } from "./budgetActionItemCell";
import { BudgetActionItemOverBudget } from "./budgetActionItemOverBudget";

vi.mock("./budgetActionItemCell", () => ({
	BudgetActionItemCell: vi.fn(() => <div data-testid="cell" />),
}));

const commonProps = {
	category: buildCategory(),
	periodEnd: { month: 3, year: 2025 },
	subcategory: buildSubcategory(),
};

const lastCellProps = () => vi.mocked(BudgetActionItemCell).mock.lastCall?.[0];

describe("budget action item variants", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders an above-average item", () => {
		render(
			<BudgetActionItemAboveAverage
				{...commonProps}
				data={{
					budgetTotal: 1200,
					monthlyAverage: 100,
					remaining: 400,
					spentThisMonth: 800,
					spentThisPeriod: 800,
					subcategoryId: 1,
					type: "aboveAverage",
				}}
			/>,
		);

		expect(lastCellProps()).toMatchObject({
			category: commonProps.category,
			periodEnd: commonProps.periodEnd,
			subcategory: commonProps.subcategory,
		});
		expect(lastCellProps()?.subcontent).toContain("over monthly average");
	});

	it.each([
		{ currentSpent: 50, expected: "since previous", previousSpent: 100 },
		{ currentSpent: 150, expected: "over budget", previousSpent: 100 },
	])("describes a budget change from $previousSpent to $currentSpent", ({
		currentSpent,
		expected,
		previousSpent,
	}) => {
		render(
			<BudgetActionItemBudgetChange
				{...commonProps}
				data={{
					budgeted: 100,
					currentSpent,
					periodMonths: 1,
					previousSpent,
					subcategoryId: 1,
					type: "budgetChange",
				}}
			/>,
		);

		expect(lastCellProps()?.subcontent).toContain(expected);
	});

	it.each([
		{ frequency: 1, periodEnd: { month: 3, year: 2025 } },
		{ frequency: 6, periodEnd: { month: 2, year: 2025 } },
	])("renders an over-budget item spanning $frequency month(s)", ({
		frequency,
		periodEnd,
	}) => {
		render(
			<BudgetActionItemOverBudget
				{...commonProps}
				data={{
					budgeted: 100,
					frequency,
					spent: 150,
					subcategoryId: 1,
					type: "overBudget",
				}}
				periodEnd={periodEnd}
			/>,
		);

		expect(lastCellProps()).toMatchObject({
			category: commonProps.category,
			subcategory: commonProps.subcategory,
		});
		expect(lastCellProps()).not.toHaveProperty("periodEnd");
	});
});
