import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DateTime } from "luxon";

interface ChartItem {
	color: string;
	name: string;
	value: number;
}

export const buildChartData = (
	items: ChartItem[],
	maxItems: number,
	otherLabel: string,
): ChartItem[] => {
	if (items.length <= maxItems) {
		return items;
	}

	const firstItem = items[maxItems - 1];
	invariant(firstItem);

	return [
		...items.slice(0, maxItems - 1),
		{
			color: firstItem.color,
			name: otherLabel,
			value: items
				.slice(maxItems - 1)
				.reduce((total, item) => total + item.value, 0),
		},
	];
};

export const getDateWindow = (
	startDateIso: string | undefined,
	endDateIso: string | undefined,
): [DateTime<true>, DateTime<true>] => {
	let startDate = startDateIso ? DateTime.fromISO(startDateIso) : undefined;
	let endDate = endDateIso ? DateTime.fromISO(endDateIso) : undefined;

	if (!startDate?.isValid && !endDate?.isValid) {
		const aMonthAgo = DateTime.now().minus({ months: 1 });
		return [aMonthAgo.startOf("month"), aMonthAgo.endOf("month")];
	}

	if (!startDate?.isValid) {
		invariant(
			endDate?.isValid,
			"endDate must be valid when startDate is not",
		);
		startDate = endDate.minus({ months: 1 });
	}

	if (!endDate?.isValid) {
		invariant(
			startDate.isValid,
			"startDate must be valid when endDate is not",
		);
		endDate = startDate.plus({ months: 1 });
	}

	return [startDate.startOf("day"), endDate.endOf("day")];
};
