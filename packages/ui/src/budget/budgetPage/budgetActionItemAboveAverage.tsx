import { type AboveAverageItem } from "@tally/data-models/contracts/api/getBudgetSummary";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../../format";
import {
	BudgetActionItemCell,
	type BudgetActionItemCommonProps,
} from "./budgetActionItemCell";

interface Props extends BudgetActionItemCommonProps {
	data: AboveAverageItem;
}

export const BudgetActionItemAboveAverage: React.FC<Props> = ({
	data,
	...restProps
}) => {
	const t = useTranslations("budget");

	const periodMonths = Math.round(data.budgetTotal / data.monthlyAverage);

	//  › Gifts: $800 this month ($1,200 annual = $100/mo avg)
	//    Still $400 remaining for the year
	//
	// <bold>{amount}</bold> most recent month ({totalBudget} per {period} = {averageBudget})
	return (
		<BudgetActionItemCell
			{...restProps}
			content={t.rich("overview.aboveAverage", {
				amount: formatCurrency(data.spentThisMonth),
				averageBudget: formatCurrency(data.monthlyAverage),
				bold: (chunks) => <b>{chunks}</b>,
				period: `${periodMonths} months`, // TODO
				totalBudget: formatCurrency(data.budgetTotal),
			})}
		/>
	);
};
