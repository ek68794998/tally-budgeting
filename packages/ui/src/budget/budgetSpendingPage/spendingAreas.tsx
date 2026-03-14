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

interface Props {
	error: unknown;
	isLoading: boolean;
	spendingData: GetBudgetSpendingResponse | undefined;
}

export const SpendingAreas: React.FC<Props> = ({
	error,
	isLoading,
	spendingData,
}) => {
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

	const { spentOnNeedsCents, spentOnSavingsCents, spentOnWantsCents } =
		spendingData;

	const spentOnNeeds = Dollars.fromCents(spentOnNeedsCents);
	const spentOnSavings = Dollars.fromCents(spentOnSavingsCents);
	const spentOnWants = Dollars.fromCents(spentOnWantsCents);

	return (
		<DonutChart
			data={[
				{
					color: ChartColors[0],
					name: t("areas.needs"),
					value: spentOnNeeds,
				},
				{
					color: ChartColors[1],
					name: t("areas.wants"),
					value: spentOnWants,
				},
				{
					color: ChartColors[2],
					name: t("areas.savings"),
					value: spentOnSavings,
				},
			]}
			formatValue={formatCurrency}
			legend={{ enabled: true }}
			size={340}
			title={t("areaChartTitle")}
		/>
	);
};
