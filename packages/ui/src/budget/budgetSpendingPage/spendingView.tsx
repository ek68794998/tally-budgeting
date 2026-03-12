"use client";

import { invariant } from "@ekumlin/typescript-toolkit/values";
import { Card, CardBody, Spinner } from "@heroui/react";
import {
	type GetBudgetSpendingQuery,
	getBudgetSpendingResponseSchema,
} from "@tally/data-models/contracts/api/getBudgetSpending";
import { Dollars } from "@tally/utilities/financial/dollars";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type DateTime } from "luxon";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ZodError, z } from "zod";
import { DonutChart } from "../../charts/donutChart";
import { ChartColors } from "../../colors";
import { formatCurrency } from "../../format";
import { useCategories } from "../../hooks/store/useCategories";
import { buildChartData, getDateWindow } from "./helpers";

const maximumChartItems = 16;

const searchParamsSchema = z.object({
	end: z.iso.date().optional(),
	start: z.iso.date().optional(),
});

const getChartColor = (index: number) => ChartColors[index] || ChartColors[0];

export const SpendingView: React.FC = () => {
	const { subcategories } = useCategories();
	const searchParams = useSearchParams();
	const t = useTranslations("budget.spending");

	const searchParamsObject = Object.fromEntries(searchParams.entries());
	const parsedSearchParams = searchParamsSchema.safeParse(searchParamsObject);

	let startDate: DateTime<true> | undefined;
	let endDate: DateTime<true> | undefined;

	if (parsedSearchParams.success) {
		[startDate, endDate] = getDateWindow(
			parsedSearchParams.data.start,
			parsedSearchParams.data.end,
		);
	}

	const { data, error, isFetching } = useQuery({
		enabled: !!(startDate && endDate),
		placeholderData: keepPreviousData,
		queryFn: async ({ signal }) => {
			invariant(
				startDate && endDate,
				"startDate and endDate must be valid",
			);

			const lookupParams: GetBudgetSpendingQuery = {
				endDate: endDate.toISO(),
				startDate: startDate.toISO(),
			};
			const urlSearchParams = new URLSearchParams(lookupParams);

			const response = await fetch(
				buildApiRoute(api.budget.spending, { query: urlSearchParams }),
				{ signal },
			);

			const json: unknown = await response.json();
			const result = getBudgetSpendingResponseSchema.parse(json);

			return result;
		},
		queryKey: ["budgetSpending", searchParams],
		retry: (failureCount, attemptError) => {
			if (failureCount >= 3) {
				return false;
			}

			if (attemptError instanceof ZodError) {
				return false;
			}

			return true;
		},
	});

	if (!parsedSearchParams.success) {
		return "INVALID DATES";
	}

	if (error || !data) {
		return `ERROR: ${error?.message}`;
	}

	if (isFetching) {
		return <Spinner />;
	}

	const { data: spendingData } = data;

	const chartData = spendingData.map((item, i) => ({
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
		<div>
			{/* Table controls */}
			<Card isBlurred={true}>
				<CardBody className="p-8">
					<DonutChart
						data={reducedChartData}
						formatValue={formatCurrency}
						size={400}
						title={t("chartTitle")}
					/>
				</CardBody>
			</Card>
			{/*  */}
		</div>
	);
};
