"use client";

import { type Asset } from "@tally/data-models/contracts/asset";
import { Card, CardBody } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { DonutChart } from "../charts/donutChart";
import { ChartColors } from "../colors";
import { formatCurrency } from "../format";

interface Props {
	assets: Asset[];
}

export const LiabilityDistribution: React.FC<Props> = ({ assets }) => {
	const t = useTranslations();

	const dataPoints = useMemo(() => {
		let shortTerm = 0;
		let longTerm = 0;

		for (const asset of assets) {
			if (asset.type === "shortTermLiability") {
				shortTerm += asset.value;
			} else if (asset.type === "longTermLiability") {
				longTerm += asset.value;
			}
		}

		return [
			{
				name: t("assets.types.longTermLiability", { plural: "yes" }),
				value: longTerm,
			},
			{
				name: t("assets.types.shortTermLiability", { plural: "yes" }),
				value: shortTerm,
			},
		];
	}, [assets, t]);

	const getChartColor = (index: number) =>
		ChartColors[index] || ChartColors[0];

	return (
		<Card isBlurred={true}>
			<CardBody className="p-8">
				<DonutChart
					data={dataPoints.map((dataPoint, i) => ({
						...dataPoint,
						color: getChartColor(i),
					}))}
					formatValue={(value) => formatCurrency(value)}
					size={300}
					title={t("netWorth.liabilityDistribution")}
				/>
			</CardBody>
		</Card>
	);
};
