"use client";

import { Spinner } from "@heroui/react";
import { IconX } from "@tabler/icons-react";
import {
	type GetBudgetQuery,
	getBudgetSummaryResponseSchema,
} from "@tally/data-models/contracts/api/getBudgetSummary";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { type BudgetDate } from "../types";
import { BudgetActionItems } from "./budgetActionItems";
import { BudgetCategoriesList } from "./budgetCategoriesList";
import { BudgetQuickPulseCharts } from "./budgetQuickPulseCharts";

interface Props {
	periodEnd: BudgetDate;
}

export const BudgetDetails: React.FC<Props> = ({ periodEnd }) => {
	const t = useTranslations("budget");

	const searchParams: GetBudgetQuery = {
		endMonth: String(periodEnd.month),
		endYear: String(periodEnd.year),
	};

	const { data, error, isFetching } = useQuery({
		placeholderData: keepPreviousData,
		queryFn: async ({ signal }) => {
			const urlSearchParams = new URLSearchParams(searchParams);

			const response = await fetch(
				buildApiRoute(api.budget.summary, { query: urlSearchParams }),
				{ signal },
			);

			const json: unknown = await response.json();
			const result = getBudgetSummaryResponseSchema.parse(json);

			return result;
		},
		queryKey: ["budgetSummary", searchParams],
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

	if (isFetching) {
		return <Spinner />;
	}

	if (error || !data) {
		console.error(error); // TODO (#2)
		return <IconX />;
	}

	const headerClassName = "mb-2 mt-6 text-2xl font-black";

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h2 className={twMerge(headerClassName, "mt-0")}>
					{t("quickPulse.title")}
				</h2>
				<BudgetQuickPulseCharts data={data.quickPulse} />
				<h2 className={headerClassName}>{t("overview.title")}</h2>
				<BudgetActionItems
					data={data.actionItems}
					periodEnd={periodEnd}
				/>
				<h2 className={headerClassName}>{t("categoriesView.title")}</h2>
				<BudgetCategoriesList
					data={data.budgetBreakdown}
					periodEnd={periodEnd}
				/>
			</div>
		</div>
	);
};
