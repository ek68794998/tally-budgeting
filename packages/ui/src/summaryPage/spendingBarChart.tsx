"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { type Summary } from "@tally/utilities/summary/calculateSummary";
import { useTranslations } from "next-intl";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { getTooltipText } from "../charts/helpers";
import { ChartColors } from "../colors";
import { formatCurrency } from "../format";
import { spendingDataPointSchema, useSpendingData } from "./useSpendingData";

interface Props {
	summary: Summary;
	type: "monthly" | "yearly";
}

export const SpendingBarChart: React.FC<Props> = ({ summary, type }) => {
	const t = useTranslations("summary");
	const isMonthly = type === "monthly";

	const data = useSpendingData({
		spendingPeriod: type,
		summary,
	});

	return (
		<Card className="min-h-96" isBlurred={true}>
			<CardHeader>
				<h2 className="text-2xl font-black">
					{t(
						isMonthly
							? "spendChart.titleMonthly"
							: "spendChart.titleYearly",
					)}
				</h2>
			</CardHeader>
			<CardBody className="overflow-visible">
				<ResponsiveContainer height="100%" width="100%">
					<BarChart data={data} dataKey="longName">
						<XAxis
							dataKey="shortName"
							interval="preserveStartEnd"
							minTickGap={30}
							tick={{
								className: "text-sm font-medium text-stone-900",
							}}
						/>
						<YAxis
							domain={[0, "dataMax"]}
							tick={{
								className: "text-sm font-medium text-stone-900",
							}}
							tickFormatter={(value) =>
								`${formatCurrency(Number(value) / 1000)}k`
							}
							type="number"
						/>
						<CartesianGrid strokeDasharray="3 3" />
						<Tooltip
							animationDuration={0} // Workaround for: https://github.com/shadcn-ui/ui/issues/8005
							formatter={(value, name) => [
								formatCurrency(Number(value)),
								t(
									name === "valueEarned"
										? "spendChart.earned"
										: "spendChart.spending",
								),
							]}
							labelFormatter={(value, tooltipData) => {
								const text = getTooltipText(
									value,
									tooltipData,
									spendingDataPointSchema,
									"longName",
								);

								return (
									<span className="text-sm font-medium text-stone-900">
										{text}
									</span>
								);
							}}
						/>
						<Bar dataKey="valueSpent" fill={ChartColors[1]} />
						<Bar dataKey="valueEarned" fill={ChartColors[0]} />
					</BarChart>
				</ResponsiveContainer>
			</CardBody>
		</Card>
	);
};
