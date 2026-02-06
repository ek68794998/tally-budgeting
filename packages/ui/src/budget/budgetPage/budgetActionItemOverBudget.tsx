import { type OverBudgetItem } from "@tally/data-models/contracts/api/getBudgetSummary";
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
	...restProps
}) => {
	const t = useTranslations("budget");

	return (
		<BudgetActionItemCell
			{...restProps}
			content={t.rich("spentInBudget", {
				bold: (chunks) => <b>{chunks}</b>,
				budget: formatCurrency(data.budgeted),
				period: `(${data.frequency} months)`, // TODO
				spent: formatCurrency(data.spent),
			})}
		/>
	);
};
