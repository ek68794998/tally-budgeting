import { z } from "zod";
import { createApiResponseSchema } from "./types";

export const getBudgetSpendingQuerySchema = z.object({
  endDate: z.union([z.iso.date(), z.iso.datetime({ offset: true })]),
  startDate: z.union([z.iso.date(), z.iso.datetime({ offset: true })]),
});

export type GetBudgetSpendingQuery = z.infer<
  typeof getBudgetSpendingQuerySchema
>;

export const getBudgetSpendingResponseSchema = createApiResponseSchema({
  spending: z.array(
    z.object({
      spentCents: z.int(),
      subcategoryId: z.int(),
    }),
  ),
  spentOnNeedsCents: z.int(),
  spentOnSavingsCents: z.int(),
  spentOnWantsCents: z.int(),
});

export type GetBudgetSpendingResponse = z.infer<
  typeof getBudgetSpendingResponseSchema
>;
