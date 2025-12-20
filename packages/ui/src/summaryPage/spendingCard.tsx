"use client";

import { type Summary } from "@tally/utilities/summary/calculateSummary";
import { useTranslations } from "next-intl";
import { DataCard } from "../common/dataCard";
import { formatCurrency } from "../format";
import { type SpendingPeriod, useSpendingData } from "./useSpendingData";

interface Props {
	summary: Summary;
	type: SpendingPeriod;
}

const showCentsIfLessThanDigits = 2;

export const SpendingCard: React.FC<Props> = ({ summary, type }) => {
	const t = useTranslations("summary");
	const isMonthly = type === "monthly";

	const [_, { valueEarned: currentIncome, valueSpent: currentExpenses }] =
		useSpendingData({
			spendingPeriod: type,
			summary,
		});

	return (
		<DataCard
			centered={true}
			data={[
				{
					title: t(
						isMonthly
							? "spendCard.spendMonthly"
							: "spendCard.spendYearly",
					),
					value: formatCurrency(currentExpenses, {
						showCentsIfLessThanDigits,
					}),
				},
				{
					title: t(
						isMonthly
							? "spendCard.earnedMonthly"
							: "spendCard.earnedYearly",
					),
					value: formatCurrency(currentIncome, {
						showCentsIfLessThanDigits,
					}),
				},
			]}
			size="xl"
		/>
	);
};
