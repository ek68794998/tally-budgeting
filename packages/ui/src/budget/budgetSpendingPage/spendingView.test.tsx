import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { mockIncompleteObject } from "@tally/testing/mockIncompleteObject";
import { render } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SpendingAreas } from "./spendingAreas";
import { SpendingChart } from "./spendingChart";
import { SpendingTableControls } from "./spendingTableControls";
import { SpendingView } from "./spendingView";
import { useSpendingData } from "./useSpendingData";

vi.mock("next/navigation", () => ({
	useRouter: vi.fn(),
	useSearchParams: vi.fn(),
}));
vi.mock("./spendingAreas", () => ({
	SpendingAreas: vi.fn(() => <div data-testid="areas" />),
}));
vi.mock("./spendingChart", () => ({
	SpendingChart: vi.fn(() => <div data-testid="chart" />),
}));
vi.mock("./spendingTableControls", () => ({
	SpendingTableControls: vi.fn(() => <div data-testid="controls" />),
}));
vi.mock("./useSpendingData", () => ({ useSpendingData: vi.fn() }));

const push = vi.fn();

const renderView = (query: string) => {
	vi.mocked(useSearchParams).mockReturnValue(
		dangerouslyCoerceType<ReturnType<typeof useSearchParams>>(
			new URLSearchParams(query),
		),
	);

	render(<SpendingView />);

	return vi.mocked(SpendingTableControls).mock.lastCall?.[0];
};

describe("SpendingView", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useRouter).mockReturnValue(
			mockIncompleteObject<ReturnType<typeof useRouter>>({ push }),
		);
		vi.mocked(useSpendingData).mockReturnValue(
			mockIncompleteObject<ReturnType<typeof useSpendingData>>({
				data: undefined,
				error: null,
				isFetching: true,
			}),
		);
	});

	it("reads the date window from the URL and passes spending state to the charts", () => {
		const controls = renderView("start=2025-01-01&end=2025-01-31");

		expect(controls?.startDate?.toISODate()).toBe("2025-01-01");
		expect(controls?.endDate?.toISODate()).toBe("2025-01-31");

		for (const Chart of [SpendingAreas, SpendingChart]) {
			expect(Chart).toHaveBeenCalledWith(
				{ error: null, isLoading: true, spendingData: undefined },
				undefined,
			);
		}
	});

	it("updates the URL when the dates change", () => {
		const controls = renderView("start=2025-01-01&end=2025-01-31");
		const newDate = controls?.startDate?.plus({ days: 2 });

		if (newDate) {
			controls?.onChangeStartDate(newDate);
			controls?.onChangeEndDate(newDate);
		}

		expect(push.mock.calls).toEqual([
			["?start=2025-01-03&end=2025-01-31"],
			["?start=2025-01-01&end=2025-01-03"],
		]);
	});

	it("leaves the dates unset for malformed search params", () => {
		const controls = renderView("start=garbage");

		expect(controls?.startDate).toBeUndefined();
		expect(useSpendingData).toHaveBeenCalledWith(undefined, undefined);
	});
});
