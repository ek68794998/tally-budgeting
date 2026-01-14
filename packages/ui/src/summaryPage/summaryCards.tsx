"use client";

import { Tab, Tabs } from "@heroui/react";
import { type Summary } from "@tally/utilities/summary/calculateSummary";
import { SpendingBarChart } from "./spendingBarChart";
import { SpendingCard } from "./spendingCard";

interface Props {
	summary: Summary;
}

const SummaryCardsForPeriod: React.FC<
	Props & { type: "monthly" | "yearly" }
> = ({ summary, type }) => (
	<div className="grid grid-cols-2 justify-stretch gap-4">
		<SpendingBarChart summary={summary} type={type} />
		<SpendingCard summary={summary} type={type} />
	</div>
);

export const SummaryCards: React.FC<Props> = ({ summary }) => (
	<div className="flex flex-col items-stretch">
		<Tabs
			classNames={{ base: "mx-auto", tab: "w-72" }}
			color="success"
			size="lg"
		>
			<Tab key="monthly" title="Monthly">
				<SummaryCardsForPeriod summary={summary} type="monthly" />
			</Tab>
			<Tab key="yearly" title="Yearly">
				<SummaryCardsForPeriod summary={summary} type="yearly" />
			</Tab>
		</Tabs>
	</div>
);
