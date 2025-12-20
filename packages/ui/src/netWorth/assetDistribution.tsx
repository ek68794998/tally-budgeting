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

export const AssetDistribution: React.FC<Props> = ({ assets }) => {
	const t = useTranslations();

	const dataPoints = useMemo(() => {
		let personalValue = 0;
		let fixedValue = 0;
		let liquidValue = 0;

		for (const asset of assets) {
			if (asset.type === "fixedAsset") {
				fixedValue += asset.value;
			} else if (asset.type === "liquidAsset") {
				liquidValue += asset.value;
			} else if (asset.type === "personalAsset") {
				personalValue += asset.value;
			}
		}

		return [
			{
				name: t("assets.types.fixedAsset", { plural: "yes" }),
				value: fixedValue,
			},
			{
				name: t("assets.types.liquidAsset", { plural: "yes" }),
				value: liquidValue,
			},
			{
				name: t("assets.types.personalAsset", { plural: "yes" }),
				value: personalValue,
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
					title={t("netWorth.assetDistribution")}
				/>
			</CardBody>
		</Card>
	);
};
