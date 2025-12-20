import { Card, CardBody, Progress, type ProgressProps } from "@heroui/react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "../format";

interface Props {
	budgeted: number;
	income: number;
	spent: number;
}

export const BudgetOverviewCard: React.FC<Props> = ({
	budgeted,
	income,
	spent,
}) => {
	const t = useTranslations("budget");

	const titleClassName = "text-2xl font-light opacity-75";
	const subtitleClassName = "text-lg font-light opacity-75";
	const valueClassName = "text-3xl font-black";

	const color: ProgressProps["color"] =
		spent > budgeted ? "danger" : "success";

	const spendingColorClassName =
		spent > budgeted ? "text-danger-700" : "text-success-700";

	return (
		<Card className="col-span-2" isBlurred={true}>
			<CardBody className="flex flex-col justify-center p-0">
				<div className="flex h-full flex-col items-start gap-5 p-7">
					<div className={titleClassName}>
						{t("summary.overview")}
					</div>
					<div className="grid w-full grid-cols-3 gap-1 text-2xl font-light">
						<div className={subtitleClassName}>
							{t("summary.subtitleBudget")}
						</div>
						<div className={subtitleClassName}>
							{t("summary.subtitleSpending")}
						</div>
						<div className={subtitleClassName}>
							{t("summary.subtitleRemaining")}
						</div>
						<div className={valueClassName}>
							{formatCurrency(budgeted)}
							<p className="mt-1 mb-0 text-sm font-semibold opacity-70">
								{t("summary.subtitleIncome", {
									income: formatCurrency(income),
								})}
							</p>
						</div>
						<div className={valueClassName}>
							<span className={spendingColorClassName}>
								{formatCurrency(spent)}
							</span>
						</div>
						<div className={valueClassName}>
							<span className={spendingColorClassName}>
								{formatCurrency(Math.max(budgeted - spent, 0))}
							</span>
						</div>
					</div>
					<Progress
						aria-label="Last 12 months spending"
						color={color}
						maxValue={budgeted}
						value={spent}
					/>
				</div>
			</CardBody>
		</Card>
	);
};
