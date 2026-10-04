import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DatePicker } from "@heroui/react";
import {
  type CalendarDate,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";
import { DateTime, Duration } from "luxon";
import { useTranslations } from "next-intl";
import { useDebounceCallback } from "../../hooks/useDebounceCallback";

interface Props {
  endDate: DateTime<true> | undefined;
  onChangeEndDate: (date: DateTime<true>) => void;
  onChangeStartDate: (date: DateTime<true>) => void;
  startDate: DateTime<true> | undefined;
}

const debounceDuration = Duration.fromObject({
  milliseconds: 500,
});

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

  const { run: handleChangeDate } = useDebounceCallback(
    (date: CalendarDate | null, type: "start" | "end") => {
      if (!date) {
        return;
      }

      const dateTime = DateTime.fromISO(`${date.toString()}T12:00:00Z`);
      invariant(dateTime.isValid);

      const callback = type === "start" ? onChangeStartDate : onChangeEndDate;
      callback(dateTime);
    },
    { wait: debounceDuration.toMillis() },
  );

  return (
    <div className="flex gap-4">
      {startDateValue ? (
        <DatePicker
          defaultValue={startDateValue}
          label={t("startDate")}
          maxValue={endDateValue}
          onChange={(v) => handleChangeDate(v, "start")}
        />
      ) : (
        <DatePicker isDisabled={true} />
      )}
      {endDateValue ? (
        <DatePicker
          defaultValue={endDateValue}
          label={t("endDate")}
          maxValue={today(getLocalTimeZone())}
          minValue={startDateValue}
          onChange={(v) => handleChangeDate(v, "end")}
        />
      ) : (
        <DatePicker isDisabled={true} />
      )}
    </div>
  );
};
