import { type GetBudgetSummaryResponse } from "@tally/data-models/contracts/api/getBudgetSummary";
import { render, screen, waitFor } from "@testing-library/react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { createQueryClientWrapper } from "../../testing/queryClient";
import { BudgetActionItems } from "./budgetActionItems";
import { BudgetDetails } from "./budgetDetails";

const { error } = vi.hoisted(() => ({
	error: vi.fn<(code: string, data: { error?: string }) => void>(),
}));

vi.mock("@tally/utilities/telemetry/telemetry", () => ({
	telemetry: () => ({ error }),
}));
vi.mock("./budgetActionItems", () => ({
	BudgetActionItems: vi.fn(() => <div data-testid="actionItems" />),
}));
vi.mock("./budgetCategoriesList", () => ({
	BudgetCategoriesList: vi.fn(() => <div data-testid="categoriesList" />),
}));
vi.mock("./budgetQuickPulseCharts", () => ({
	BudgetQuickPulseCharts: vi.fn(() => <div data-testid="quickPulse" />),
}));

const period = { budgeted: 1, income: 1, spent: 1 };

const summary: GetBudgetSummaryResponse = {
	actionItems: {
		aboveAverage: [],
		improved: [],
		overBudget: [],
		worsened: [],
	},
	aiSummary: null,
	budgetBreakdown: [],
	quickPulse: {
		last12Months: { ...period, duration: "last12Months" },
		lastMonth: { ...period, duration: "lastMonth" },
	},
	success: true,
};

let fetchMock: Mock<typeof fetch>;

const renderDetails = () => {
	const { wrapper } = createQueryClientWrapper();

	return render(<BudgetDetails periodEnd={{ month: 3, year: 2025 }} />, {
		wrapper,
	});
};

describe("BudgetDetails", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fetchMock = vi.fn<typeof fetch>();
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("loads the summary for the period and renders each section", async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify(summary)));

		renderDetails();

		expect(screen.getByLabelText("Loading")).toBeInTheDocument();
		expect(await screen.findByTestId("quickPulse")).toBeInTheDocument();
		expect(screen.getByTestId("categoriesList")).toBeInTheDocument();
		expect(BudgetActionItems).toHaveBeenCalledWith(
			{ data: summary.actionItems, periodEnd: { month: 3, year: 2025 } },
			undefined,
		);
		const input = fetchMock.mock.lastCall?.[0];

		expect(typeof input === "string" ? input : "").toContain(
			"endMonth=3&endYear=2025",
		);
	});

	it("reports a malformed response without retrying", async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify({ nope: 1 })));

		renderDetails();

		await waitFor(() => {
			expect(error.mock.lastCall?.[0]).toBe("BUDGET_API_ERROR");
		});
		expect(error.mock.lastCall?.[1].error).toBeTypeOf("string");
		expect(fetchMock).toHaveBeenCalledOnce();
		expect(screen.queryByTestId("quickPulse")).toBeNull();
	});
});
