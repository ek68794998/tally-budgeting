import { type BudgetChangeItem } from "@tally/data-models/contracts/api/getBudgetSummary";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../../format";
import { type BudgetDate } from "../types";
import {
	BudgetActionItemCell,
	type BudgetActionItemCommonProps,
} from "./budgetActionItemCell";

interface Props extends BudgetActionItemCommonProps {
	data: BudgetChangeItem;
	periodEnd: BudgetDate;
}

export const BudgetActionItemBudgetChange: React.FC<Props> = ({
	data,
	...restProps
}) => {
	const t = useTranslations("budget");

	const lastPeriod = t("durations.periodMonths", {
		months: data.periodMonths,
	});

	return (
		<BudgetActionItemCell
			{...restProps}
			content={t.rich("overview.budgetChange", {
				bold: (chunks) => <b>{chunks}</b>,
				currentSpend: formatCurrency(data.currentSpent),
				lastDate: lastPeriod,
				lastSpend: formatCurrency(data.previousSpent),
			})}
		/>
	);
};
