import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BudgetQuickPulseChart } from "./budgetQuickPulseChart";
import { BudgetQuickPulseCharts } from "./budgetQuickPulseCharts";

describe("BudgetQuickPulseChart", () => {
	beforeEach(() => {
		vi.useFakeTimers({
			now: new Date("2025-04-10T12:00:00Z"),
			toFake: ["Date"],
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it.each([
		{
			duration: "lastMonth" as const,
			expectedBar: "bg-success-600",
			expectedQuery: "end=2025-03-31&start=2025-03-01",
			spent: 50,
		},
		{
			duration: "last12Months" as const,
			expectedBar: "bg-danger-600",
			expectedQuery: "end=2025-03-31&start=2024-04-01",
			spent: 150,
		},
	])("links to spending for $duration and colors the bar", ({
		duration,
		expectedBar,
		expectedQuery,
		spent,
	}) => {
		const { container } = render(
			<BudgetQuickPulseChart
				data={{ budgeted: 100, duration, income: 200, spent }}
				title="Pulse"
			/>,
		);

		expect(screen.getByText("Pulse")).toBeInTheDocument();
		expect(
			screen
				.getByText("View Spending")
				.closest("a")
				?.getAttribute("href"),
		).toContain(expectedQuery);
		expect(container.querySelector(`.${expectedBar}`)).not.toBeNull();
	});

	it("renders charts for the last month and year", () => {
		const period = { budgeted: 1, income: 1, spent: 1 };

		render(
			<BudgetQuickPulseCharts
				data={{
					last12Months: { ...period, duration: "last12Months" },
					lastMonth: { ...period, duration: "lastMonth" },
				}}
			/>,
		);

		expect(screen.getByText("Last Month")).toBeInTheDocument();
		expect(screen.getByText("Last 12 Months")).toBeInTheDocument();
	});
});
