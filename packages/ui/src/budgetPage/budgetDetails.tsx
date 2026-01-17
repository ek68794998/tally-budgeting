"use client";

import { Spinner } from "@heroui/react";
import { IconX } from "@tabler/icons-react";
import {
	type GetBudgetQuery,
	getBudgetResponseSchema,
} from "@tally/data-models/contracts/api/getBudget";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ZodError } from "zod";
import { BudgetCategoriesList } from "./budgetCategoriesList";
import { BudgetScore } from "./budgetScore";
import { type BudgetDate } from "./types";

interface Props {
	periodEnd: BudgetDate;
}

const defaultMonths = 6;

export const BudgetDetails: React.FC<Props> = ({ periodEnd }) => {
	const [months, setMonths] = useState(defaultMonths);

	const searchParams: GetBudgetQuery = {
		endMonth: String(periodEnd.month),
		endYear: String(periodEnd.year),
		months: String(months),
	};

	const { data, error, isFetching } = useQuery({
		placeholderData: keepPreviousData,
		queryFn: async ({ signal }) => {
			const urlSearchParams = new URLSearchParams(searchParams);

			const response = await fetch(`/api/budget?${urlSearchParams}`, {
				signal,
			});

			const json: unknown = await response.json();
			const result = getBudgetResponseSchema.parse(json);

			return result;
		},
		queryKey: ["transactions", searchParams],
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
		return <IconX />;
	}

	const headerClassName = "mb-2 text-2xl font-black";

	return (
		<div className="flex flex-col gap-4">
			<BudgetScore
				headerClassName={headerClassName}
				onPeriodChange={setMonths}
				periodEnd={periodEnd}
				periodMonths={months}
				summary={data.summary}
			/>
			<BudgetCategoriesList
				headerClassName={headerClassName}
				periodEnd={periodEnd}
				subcategorySpending={data.bySubcategory}
			/>
		</div>
	);
};
