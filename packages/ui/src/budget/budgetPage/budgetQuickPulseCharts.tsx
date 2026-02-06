import { type QuickPulseData } from "@tally/data-models/contracts/api/getBudgetSummary";
import { useTranslations } from "next-intl";
import { BudgetQuickPulseChart } from "./budgetQuickPulseChart";

interface Props {
	data: QuickPulseData;
}

export const BudgetQuickPulseCharts: React.FC<Props> = ({ data }) => {
	const t = useTranslations("budget.quickPulse");

	return (
		<div className="flex gap-4">
			<div className="w-80">
				<BudgetQuickPulseChart
					data={data.lastMonth}
					title={t("month")}
				/>
			</div>
			<div className="w-80">
				<BudgetQuickPulseChart
					data={data.last12Months}
					title={t("year")}
				/>
			</div>
		</div>
	);
};
