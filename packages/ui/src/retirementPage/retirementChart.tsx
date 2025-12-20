"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ChartColors } from "../colors";
import { formatCurrency } from "../format";
import { useRetirementContext } from "./retirementProvider";

interface Props {
	className?: string;
}

const chartColor = ChartColors[0];

export const RetirementChart: React.FC<Props> = ({ className }) => {
	const linearGradientId = useId();
	const { calculatedData } = useRetirementContext();
	const t = useTranslations("retirement");

	return (
		<Card className={className} isBlurred={true}>
			<CardHeader>
				<h2 className="text-2xl font-black">{t("chart.title")}</h2>
			</CardHeader>
			<CardBody className="overflow-visible">
				<ResponsiveContainer height="100%" width="100%">
					<AreaChart data={calculatedData.dataByYear} dataKey="year">
						<defs>
							<linearGradient
								id={linearGradientId}
								x1="0"
								x2="0"
								y1="0"
								y2="1"
							>
								<stop
									offset="5%"
									stopColor={chartColor}
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor={chartColor}
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<XAxis
							dataKey="age"
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
							formatter={(value) => [
								formatCurrency(Number(value)),
								null,
							]}
							labelFormatter={(value) => (
								<p className="text-sm font-medium text-stone-900">
									{t("chart.tooltipTitle", {
										age: Number(value),
									})}
								</p>
							)}
						/>
						<Area
							dataKey="retirementAmount"
							fill={`url(#${linearGradientId})`}
							fillOpacity={1}
							stroke={chartColor}
							type="monotone"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardBody>
		</Card>
	);
};
