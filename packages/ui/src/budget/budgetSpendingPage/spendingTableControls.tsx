import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DatePicker } from "@heroui/react";
import {
	type CalendarDate,
	getLocalTimeZone,
	parseDate,
	today,
} from "@internationalized/date";
import { DateTime } from "luxon";
import { useTranslations } from "next-intl";

interface Props {
	endDate: DateTime<true> | undefined;
	onChangeEndDate: (date: DateTime<true>) => void;
	onChangeStartDate: (date: DateTime<true>) => void;
	startDate: DateTime<true> | undefined;
}

export const SpendingTableControls: React.FC<Props> = ({
	endDate,
	onChangeEndDate,
	onChangeStartDate,
	startDate,
}) => {
	const t = useTranslations("budget.spending.controls");

	const startDateValue = startDate
		? parseDate(startDate.toISODate())
		: undefined;
	const endDateValue = endDate ? parseDate(endDate.toISODate()) : undefined;

	const handleChangeDate = (
		date: CalendarDate | null,
		type: "start" | "end",
	) => {
		if (!date) {
			return;
		}

		const dateTime = DateTime.fromISO(`${date.toString()}T12:00:00Z`);
		invariant(dateTime.isValid);

		const callback = type === "start" ? onChangeStartDate : onChangeEndDate;
		callback(dateTime);
	};

	return (
		<div className="flex gap-4">
			{startDateValue ? (
				<DatePicker
					label={t("startDate")}
					maxValue={endDateValue}
					onChange={(v) => handleChangeDate(v, "start")}
					value={startDateValue}
				/>
			) : (
				<DatePicker isDisabled={true} />
			)}
			{endDateValue ? (
				<DatePicker
					label={t("endDate")}
					maxValue={today(getLocalTimeZone())}
					minValue={startDateValue}
					onChange={(v) => handleChangeDate(v, "end")}
					value={endDateValue}
				/>
			) : (
				<DatePicker isDisabled={true} />
			)}
		</div>
	);
};
