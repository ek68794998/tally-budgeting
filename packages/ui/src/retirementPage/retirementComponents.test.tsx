import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataCard } from "../common/dataCard";
import { RetirementCalculator } from "./retirementCalculator";
import { RetirementChart } from "./retirementChart";
import { RetirementInputs } from "./retirementInputs";
import { useRetirementContext } from "./retirementProvider";
import { RetirementSummaryCards } from "./retirementSummaryCards";
import { RetirementTable } from "./retirementTable";
import {
	type RetirementCalculatorInputs,
	type RetirementDataByYear,
} from "./types";

const { recharts } = vi.hoisted(() => ({
	recharts: {
		Area: vi.fn(() => null),
		AreaChart: vi.fn(({ children }: React.PropsWithChildren) => (
			<svg aria-hidden="true">{children}</svg>
		)),
		CartesianGrid: vi.fn(() => null),
		ResponsiveContainer: vi.fn(({ children }: React.PropsWithChildren) => (
			<div>{children}</div>
		)),
		Tooltip: vi.fn(
			(_props: {
				formatter: (value: number) => [string, null];
				labelFormatter: (value: number) => string;
			}) => null,
		),
		xAxis: vi.fn(() => null),
		yAxis: vi.fn(
			(_props: { tickFormatter: (value: number) => string }) => null,
		),
	},
}));

vi.mock("recharts", () => {
	const { xAxis, yAxis, ...rest } = recharts;

	return {
		...rest,
		...Object.fromEntries([
			["XAxis", xAxis],
			["YAxis", yAxis],
		]),
	};
});
vi.mock("../common/dataCard", () => ({
	DataCard: vi.fn(() => <div data-testid="data-card" />),
}));
vi.mock("./retirementProvider", () => ({
	RetirementProvider: vi.fn(({ children }: React.PropsWithChildren) => (
		<div data-testid="provider">{children}</div>
	)),
	useRetirementContext: vi.fn(),
}));

const inputs: RetirementCalculatorInputs = {
	annualInflationRatePercent: 0.03,
	annualInvestmentReturnPercent: 0.07,
	annualRaise: 0.02,
	contributionPercent: 0.1,
	currentAge: 30,
	currentPretaxIncome: 100_000,
	currentRetirementInvestments: 50_000,
	lifeExpectancy: 90,
	postRetirementIncomeNeeded: 60_000,
	retirementAge: 65,
};

const buildYear = (
	age: number,
	retirementAmount: number,
): RetirementDataByYear => ({
	addedToRetirement: 10_000,
	age,
	assumedIncome: 100_000,
	compoundInflation: 1.03,
	distributedFromRetirement: 0,
	retirementAmount,
	retirementAmountToday: retirementAmount / 2,
	year: 1995 + age,
});

const setInputs = vi.fn();

describe("retirement components", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useRetirementContext).mockReturnValue(
			mockIncompleteObject<ReturnType<typeof useRetirementContext>>({
				calculatedData: { dataByYear: [buildYear(65, 1_500_000)] },
				inputs,
				setInputs,
			}),
		);
	});

	it("composes the calculator inside the provider", () => {
		render(<RetirementCalculator />);

		expect(screen.getByTestId("provider")).toBeInTheDocument();
		expect(screen.getByText("Calculator Inputs")).toBeInTheDocument();
		expect(screen.getByText("Retirement by Year")).toBeInTheDocument();
	});

	it("updates a single input while keeping the others", () => {
		render(<RetirementInputs />);

		const currentAge = screen.getByLabelText("Current Age");
		fireEvent.change(currentAge, { target: { value: "31" } });
		fireEvent.blur(currentAge);

		expect(setInputs).toHaveBeenLastCalledWith({
			...inputs,
			currentAge: 31,
		});
	});

	it("formats the chart axis and tooltip", () => {
		render(<RetirementChart />);

		const tooltipProps = recharts.Tooltip.mock.lastCall?.[0];

		expect(recharts.yAxis.mock.lastCall?.[0].tickFormatter(250_000)).toBe(
			"$250k",
		);
		expect(tooltipProps?.formatter(1234)).toEqual(["$1,234", null]);
		expect(tooltipProps?.labelFormatter(65)).toBe("Age 65");
	});

	it("shows the savings remaining at retirement and at life expectancy", () => {
		render(<RetirementSummaryCards />);

		expect(
			vi.mocked(DataCard).mock.calls.map(([props]) => props.data),
		).toEqual([
			{ title: "Estimated Savings at 65", value: "$1,500,000" },
			{ title: "Estimated Savings at 90", value: "$0" },
		]);
	});

	it("lists each year's formatted values", () => {
		render(<RetirementTable />);

		expect(screen.getByText("2060")).toBeInTheDocument();
		expect(screen.getByText("$750,000")).toBeInTheDocument();
		expect(screen.getByText("1.0")).toBeInTheDocument();
	});
});
