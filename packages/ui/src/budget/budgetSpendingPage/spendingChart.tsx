import { toError } from "@ekumlin/typescript-toolkit/error";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { Spinner } from "@heroui/react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { type GetBudgetSpendingResponse } from "@tally/data-models/contracts/api/getBudgetSpending";
import { Dollars } from "@tally/utilities/financial/dollars";
import { useTranslations } from "next-intl";
import { DonutChart } from "../../charts/donutChart";
import { ChartColors } from "../../colors";
import { formatCurrency } from "../../format";
import { useCategories } from "../../hooks/store/useCategories";
import { buildChartData } from "./helpers";

interface Props {
	error: unknown;
	isLoading: boolean;
	spendingData: GetBudgetSpendingResponse | undefined;
}

const maximumChartItems = 16;

const getChartColor = (index: number) => ChartColors[index] || ChartColors[0];

export const SpendingChart: React.FC<Props> = ({
	error,
	isLoading,
	spendingData,
}) => {
	const { subcategories } = useCategories();
	const t = useTranslations("budget.spending");

	if (isLoading) {
		return <Spinner />;
	}

	const errorDetails = error
		? error
		: !spendingData?.spending.length
			? t("errors.noData")
			: undefined;

	if (errorDetails) {
		const errorObject = toError(errorDetails);
		return (
			<div className="flex flex-col items-center justify-center gap-4">
				<IconAlertTriangle size={64} />
				<div>{errorObject.message}</div>
			</div>
		);
	}

	invariant(spendingData);

	const { spending } = spendingData;

	const chartData = spending.map((item, i) => ({
		color: getChartColor(i % ChartColors.length),
		name:
			subcategories.find((sc) => sc.id === item.subcategoryId)?.label ??
			"",
		value: Dollars.fromCents(item.spentCents),
	}));

	const reducedChartData = buildChartData(
		chartData,
		maximumChartItems,
		t("otherLabel"),
	);

	return (
		<DonutChart
			data={reducedChartData}
			formatValue={formatCurrency}
			legend={{
				enabled: true,
				maxItems: maximumChartItems / 2,
				sortBy: "value",
			}}
			size={340}
			title={t("categoryChartTitle")}
		/>
	);
};
