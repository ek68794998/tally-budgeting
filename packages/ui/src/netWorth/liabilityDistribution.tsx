"use client";

import { Card, CardBody } from "@heroui/react";
import { type Asset } from "@tally/data-models/contracts/asset";
import { Dollars } from "@tally/utilities/financial/dollars";
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
			const assetValue = Dollars.fromCents(asset.valueCents);

			if (asset.type === "short_term_liability") {
				shortTerm += assetValue;
			} else if (asset.type === "long_term_liability") {
				longTerm += assetValue;
			}
		}

		return [
			{
				name: t("assets.types.long_term_liability", { plural: "yes" }),
				value: longTerm,
			},
			{
				name: t("assets.types.short_term_liability", { plural: "yes" }),
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
					title={t("assets.netWorth.liabilityDistribution")}
				/>
			</CardBody>
		</Card>
	);
};
