import { type OverBudgetItem } from "@tally/data-models/contracts/api/getBudgetSummary";
import { DateTime } from "luxon";
import { useLocale, useTranslations } from "next-intl";
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
	const locale = useLocale();
	const t = useTranslations("budget");

	const periodEndDate = DateTime.fromObject({ ...periodEnd });
	const periodStartDate = periodEndDate.minus({
		months: data.frequency - 1,
	});

	const dateLabelFormat: Intl.DateTimeFormatOptions =
		periodEndDate.year === periodStartDate.year
			? { month: "long" }
			: { month: "long", year: "numeric" };

	const endLabel = periodEndDate.toLocaleString(dateLabelFormat, { locale });
	const startLabel = periodStartDate.toLocaleString(dateLabelFormat, {
		locale,
	});

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
