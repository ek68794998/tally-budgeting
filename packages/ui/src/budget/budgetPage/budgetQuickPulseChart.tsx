import { type QuickPulsePeriod } from "@tally/data-models/contracts/api/getBudgetSummary";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { DataCard } from "../../common/dataCard";
import { formatCurrency } from "../../format";

interface Props {
	data: QuickPulsePeriod;
	title: string;
}

export const BudgetQuickPulseChart: React.FC<Props> = ({
	data: { budgeted, income, spent },
	title,
}) => {
	const t = useTranslations("budget.quickPulse");

	const budgetText = t.rich("spent", {
		budget: formatCurrency(budgeted, { showCents: false }),
		budgetFmt: (chunks) => <span className="font-bold">{chunks}</span>,
		spent: formatCurrency(spent, { showCents: false }),
		spentFmt: (chunks) => (
			<span
				className={twMerge(
					"font-bold",
					spent > budgeted ? "text-danger-600" : "text-success-600",
				)}
			>
				{chunks}
			</span>
		),
	});

	return (
		<DataCard
			centered={false}
			data={{
				title,
				value: (
					<div className="flex w-full flex-col items-start gap-2 font-normal">
						<h3 className="text-2xl">{budgetText}</h3>
						<div className="h-8 w-full rounded-lg bg-stone-300 dark:bg-stone-600">
							<div
								className={twMerge(
									"h-full rounded-lg",
									spent > budgeted
										? "bg-danger-600"
										: "bg-success-600",
								)}
								style={{
									width: `${Math.min(1, spent / budgeted) * 100}%`,
								}}
							/>
						</div>
						<h3 className="text-sm">
							{t.rich("income", {
								amount: formatCurrency(income),
								bold: (chunks) => <b>{chunks}</b>,
							})}
						</h3>
					</div>
				),
			}}
			size="md"
		/>
	);
};
