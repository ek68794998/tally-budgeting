import { CalendarDate } from "@internationalized/date";
import { render } from "@testing-library/react";
import { DateTime } from "luxon";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SpendingTableControls } from "./spendingTableControls";

const { DatePicker } = vi.hoisted(() => ({
	DatePicker: vi.fn(
		(_props: {
			isDisabled?: boolean;
			label?: string;
			onChange?: (value: unknown) => void;
		}) => <div data-testid="date-picker" />,
	),
}));

vi.mock("@heroui/react", async (importOriginal) => ({
	...(await importOriginal<typeof import("@heroui/react")>()),
	DatePicker,
}));

const startDate = DateTime.fromISO("2025-01-01T12:00:00Z");
const endDate = DateTime.fromISO("2025-01-31T12:00:00Z");

const getPicker = (label: string) =>
	DatePicker.mock.calls
		.map(([props]) => props)
		.filter((props) => props.label === label)
		.at(-1);

describe("SpendingTableControls", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("debounces date changes and reports them at noon UTC", () => {
		const onChangeEndDate = vi.fn<(date: DateTime) => void>();
		const onChangeStartDate = vi.fn<(date: DateTime) => void>();

		render(
			<SpendingTableControls
				endDate={endDate.isValid ? endDate : undefined}
				onChangeEndDate={onChangeEndDate}
				onChangeStartDate={onChangeStartDate}
				startDate={startDate.isValid ? startDate : undefined}
			/>,
		);

		getPicker("Start Date")?.onChange?.(new CalendarDate(2025, 1, 5));
		vi.advanceTimersByTime(500);
		getPicker("End Date")?.onChange?.(null);
		vi.advanceTimersByTime(500);
		getPicker("End Date")?.onChange?.(new CalendarDate(2025, 2, 10));
		vi.advanceTimersByTime(500);

		expect(
			onChangeStartDate.mock.calls.map(([date]) => date.toUTC().toISO()),
		).toEqual(["2025-01-05T12:00:00.000Z"]);
		expect(
			onChangeEndDate.mock.calls.map(([date]) => date.toUTC().toISO()),
		).toEqual(["2025-02-10T12:00:00.000Z"]);
	});

	it("disables both pickers without dates", () => {
		render(
			<SpendingTableControls
				endDate={undefined}
				onChangeEndDate={vi.fn()}
				onChangeStartDate={vi.fn()}
				startDate={undefined}
			/>,
		);

		expect(
			DatePicker.mock.calls.map(([props]) => props.isDisabled),
		).toEqual([true, true]);
	});
});
