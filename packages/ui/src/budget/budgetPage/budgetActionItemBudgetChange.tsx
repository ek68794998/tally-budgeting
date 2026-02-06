import { type BudgetChangeItem } from "@tally/data-models/contracts/api/getBudgetSummary";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { formatCurrency } from "../../format";
import {
	BudgetActionItemCell,
	type BudgetActionItemCommonProps,
} from "./budgetActionItemCell";

interface Props extends BudgetActionItemCommonProps {
	data: BudgetChangeItem;
}

const percentageFormatter = Intl.NumberFormat("en-US", {
	maximumFractionDigits: 0,
	signDisplay: "always",
	style: "percent",
});

export const BudgetActionItemBudgetChange: React.FC<Props> = ({
	data,
	...restProps
}) => {
	const t = useTranslations("budget");

	const isImprovement = data.currentSpent < data.previousSpent;
	const changePct = isImprovement
		? (data.currentSpent - data.previousSpent) / data.previousSpent
		: data.currentSpent / data.previousSpent;

	const changeText = percentageFormatter.format(changePct);

	return (
		<BudgetActionItemCell
			{...restProps}
			content={t.rich("overview.budgetChange", {
				bold: (chunks) => <b>{chunks}</b>,
				currentSpend: formatCurrency(data.currentSpent),
				lastSpend: formatCurrency(data.previousSpent),
				spentFmt: (chunks) => (
					<b
						className={twMerge(
							isImprovement
								? "text-success-600"
								: "text-danger-600",
						)}
					>
						{chunks}
					</b>
				),
			})}
			subcontent={t(
				isImprovement
					? "overview.budgetChangeUnderSubtitle"
					: "overview.budgetChangeOverSubtitle",
				{
					amountOver: formatCurrency(
						data.currentSpent - data.budgeted,
					),
					change: changeText,
					months: data.periodMonths,
				},
			)}
		/>
	);
};
