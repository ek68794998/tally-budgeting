import { invariant } from "@ekumlin/typescript-toolkit/values";
import {
  type GetBudgetSpendingQuery,
  type GetBudgetSpendingResponse,
  getBudgetSpendingResponseSchema,
} from "@tally/data-models/contracts/api/getBudgetSpending";
import { apiFetch } from "@tally/utilities/routing/apiFetch";
import { api, buildApiRoute } from "@tally/utilities/routing/routeBuilder";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type DateTime } from "luxon";
import { useMemo } from "react";
import { ZodError } from "zod";

interface UseSpendingDataReturn {
  data: GetBudgetSpendingResponse | undefined;
  error: unknown;
  isFetching: boolean;
}

export const useSpendingData = (
  startDate: DateTime<true> | undefined,
  endDate: DateTime<true> | undefined,
): UseSpendingDataReturn => {
  const { data, error, isFetching } = useQuery({
    enabled: !!(startDate && endDate),
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      invariant(startDate && endDate, "startDate and endDate must be valid");

      const lookupParams: GetBudgetSpendingQuery = {
        endDate: endDate.toISO(),
        startDate: startDate.toISO(),
      };
      const urlSearchParams = new URLSearchParams(lookupParams);

      const response = await apiFetch(
        buildApiRoute(api.budget.spending, { query: urlSearchParams }),
        { signal },
      );

      const json: unknown = await response.json();
      const result = getBudgetSpendingResponseSchema.parse(json);

      return result;
    },
    queryKey: ["budgetSpending", startDate, endDate],
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

  return useMemo(
    () => ({
      data,
      error,
      isFetching,
    }),
    [data, error, isFetching],
  );
};
