import {
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BudgetActionItemAboveAverage } from "./budgetActionItemAboveAverage";
import { BudgetActionItemBudgetChange } from "./budgetActionItemBudgetChange";
import { BudgetActionItemCell } from "./budgetActionItemCell";
import { BudgetActionItemOverBudget } from "./budgetActionItemOverBudget";

vi.mock("./budgetActionItemCell", () => ({
	BudgetActionItemCell: vi.fn(
		({
			content,
			subcontent,
		}: {
			content: React.ReactNode;
			subcontent?: React.ReactNode;
		}) => (
			<div>
				<div data-testid="content">{content}</div>
				<div data-testid="subcontent">{subcontent}</div>
			</div>
		),
	),
}));

const commonProps = {
	category: buildCategory(),
	periodEnd: { month: 3, year: 2025 },
	subcategory: buildSubcategory(),
};

const getText = () => [
	screen.getByTestId("content").textContent,
	screen.getByTestId("subcontent").textContent,
];

const renderBudgetChange = (currentSpent: number) =>
	render(
		<BudgetActionItemBudgetChange
			{...commonProps}
			data={{
				budgeted: 100,
				currentSpent,
				periodMonths: 1,
				previousSpent: 100,
				subcategoryId: 1,
				type: "budgetChange",
			}}
		/>,
	);

describe("budget action item variants", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("describes spending above the monthly average", () => {
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

		expect(getText()).toEqual([
			"$800",
			"$700 over monthly average of $100 ($1,200 / 12 months); $400 from cap",
		]);
		expect(
			vi.mocked(BudgetActionItemCell).mock.lastCall?.[0],
		).toMatchObject({
			category: commonProps.category,
			subcategory: commonProps.subcategory,
		});
	});

	it("describes a budget improvement", () => {
		renderBudgetChange(50);

		expect(getText()).toEqual(["$100 → $50", "-50% since previous month"]);
		expect(screen.getByText("$50")).toHaveClass("text-success-600");
	});

	it("describes a budget overage", () => {
		renderBudgetChange(150);

		expect(getText()[0]).toBe("$100 → $150");
		expect(getText()[1]).toMatch(/^\$50 over budget; /u);
		expect(screen.getByText("$150")).toHaveClass("text-danger-600");
	});

	// Known bug: an overage reports `current / previous` (+150%) rather than the change (+50%).
	it.fails("reports the percent change of a budget overage", () => {
		renderBudgetChange(150);

		expect(getText()[1]).toBe("$50 over budget; +50% since previous month");
	});

	it.each([
		{
			expected: "In March",
			frequency: 1,
			periodEnd: { month: 3, year: 2025 },
		},
		{
			expected: "From September 2024 to February 2025",
			frequency: 6,
			periodEnd: { month: 2, year: 2025 },
		},
	])("describes an overage spanning $frequency month(s) as '$expected'", ({
		expected,
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

		expect(getText()).toEqual(["$150 of $100", expected]);
		expect(
			vi.mocked(BudgetActionItemCell).mock.lastCall?.[0],
		).not.toHaveProperty("periodEnd");
	});
});
