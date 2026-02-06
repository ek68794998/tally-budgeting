import { type OverBudgetItem } from "@tally/data-models/contracts/api/getBudgetSummary";
import { DateTime } from "luxon";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../../format";
import {
	BudgetActionItemCell,
	type BudgetActionItemCommonProps,
} from "./budgetActionItemCell";

interface Props extends BudgetActionItemCommonProps {
	data: OverBudgetItem;
}

export const BudgetActionItemOverBudget: React.FC<Props> = ({
	data,
	periodEnd,
	...restProps
}) => {
	const t = useTranslations("budget");

	const periodEndDate = DateTime.fromObject({ ...periodEnd });
	const periodStartDate = periodEndDate.minus({
		months: data.frequency - 1,
	});

	const dateLabelFmt =
		periodEndDate.year === periodStartDate.year ? "MMMM" : "MMMM yyyy";

	const endLabel = periodEndDate.toFormat(dateLabelFmt);
	const startLabel = periodStartDate.toFormat(dateLabelFmt);

	return (
		<BudgetActionItemCell
			{...restProps}
			content={t.rich("overview.overBudget", {
				bold: (chunks) => <b>{chunks}</b>,
				budget: formatCurrency(data.budgeted),
				spent: formatCurrency(data.spent),
			})}
			subcontent={t("overview.overBudgetSubtitle", {
				endMonth: endLabel,
				months: data.frequency,
				startMonth: startLabel,
			})}
		/>
	);
};
