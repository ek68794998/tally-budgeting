import { possibleNumberToNumber } from "@ekumlin/typescript-toolkit/number";
import { isNull } from "@ekumlin/typescript-toolkit/types";
import { CircularProgress, Select, SelectItem } from "@heroui/react";
import { type GetBudgetResponse } from "@tally/data-models/contracts/api/getBudget";
import { DateTime } from "luxon";
import { useTranslations } from "next-intl";
import { DataCard } from "../../common/dataCard";
import {
	calculateBudgetScore,
	getBudgetScoreColor,
	getBudgetScoreExplanation,
} from "../helpers";
import { type BudgetDate } from "../types";
import { BudgetOverviewCard } from "./budgetOverviewCard";

interface Props {
	headerClassName?: string;
	onPeriodChange: (months: number) => void;
	periodEnd: BudgetDate;
	periodMonths: number;
	summary: GetBudgetResponse["summary"];
}

export const BudgetScore: React.FC<Props> = ({
	headerClassName,
	onPeriodChange,
	periodEnd,
	periodMonths,
	summary,
}) => {
	const t = useTranslations("budget");

	const endDate = DateTime.fromObject(periodEnd).endOf("month");

	const spending = summary.spent;
	const income = summary.income;
	const budgeted = summary.budgeted;

	const budgetScore = calculateBudgetScore(spending, income, budgeted);
	const budgetScoreColor = getBudgetScoreColor(budgetScore);
	const budgetScoreExplanation = getBudgetScoreExplanation(budgetScore, t);

	const budgetPeriodOptions = [1, 3, 6, 12].map((value) => ({
		label: t("durations.periodMonths", { months: value }),
		value,
	}));

	return (
		<div>
			<div className="flex items-start gap-8">
				<h2 className={headerClassName}>{t("summary.title")}</h2>
				<Select
					className="w-36"
					items={budgetPeriodOptions}
					onSelectionChange={(keys) =>
						onPeriodChange(
							possibleNumberToNumber(keys.anchorKey) ??
								periodMonths,
						)
					}
					selectedKeys={[String(periodMonths)]}
					size="sm"
					variant="underlined"
				>
					{(item) => (
						<SelectItem key={String(item.value)}>
							{item.label}
						</SelectItem>
					)}
				</Select>
			</div>
			<p className="text-sm opacity-70">
				{t.rich("summary.description", {
					bold: (chunks) => <b>{chunks}</b>,
					endDate: endDate.toFormat("LLLL"),
					months: periodMonths,
				})}
			</p>
			<div className="my-4 grid max-w-6xl grid-cols-3 gap-4">
				<DataCard
					centered={true}
					data={{
						title: t("summary.cardTitle"),
						value: (
							<div className="flex flex-col items-center gap-2">
								<CircularProgress
									aria-label="Loading..."
									classNames={{
										svg: "w-24 h-24 -scale-x-100",
										value: "text-3xl font-semibold",
									}}
									color={budgetScoreColor}
									formatOptions={{
										maximumFractionDigits: 1,
										minimumFractionDigits: 1,
										style: "decimal",
									}}
									maxValue={isNull(budgetScore) ? 0 : 10}
									showValueLabel={true}
									size="lg"
									value={budgetScore ?? 0}
								/>
								<div className="text-center text-sm font-normal opacity-70">
									{budgetScoreExplanation}
								</div>
							</div>
						),
					}}
					size="lg"
				/>
				<BudgetOverviewCard
					budgeted={budgeted}
					income={income}
					spent={spending}
				/>
			</div>
		</div>
	);
};
