import { z } from "zod";
import { budgetTypeSchema } from "../budgetType";
import { createApiResponseSchema } from "./types";

const quickPulsePeriodSchema = z.object({
  budgeted: z.number(),
  duration: z.enum(["last12Months", "lastMonth"]),
  income: z.number(),
  spent: z.number(),
});

export type QuickPulsePeriod = z.infer<typeof quickPulsePeriodSchema>;

const quickPulseDataSchema = z.object({
  last12Months: quickPulsePeriodSchema,
  lastMonth: quickPulsePeriodSchema,
});

export type QuickPulseData = z.infer<typeof quickPulseDataSchema>;

const overBudgetItemSchema = z.object({
  budgeted: z.number(),
  frequency: z.int().min(1).max(12),
  spent: z.number(),
  subcategoryId: z.int(),
  type: z.literal("overBudget"),
});

export type OverBudgetItem = z.infer<typeof overBudgetItemSchema>;

const aboveAverageItemSchema = z.object({
  budgetTotal: z.number(),
  monthlyAverage: z.number(),
  remaining: z.number(),
  spentThisMonth: z.number(),
  spentThisPeriod: z.number(),
  subcategoryId: z.int(),
  type: z.literal("aboveAverage"),
});

export type AboveAverageItem = z.infer<typeof aboveAverageItemSchema>;

const budgetChangeItemSchema = z.object({
  budgeted: z.number(),
  currentSpent: z.number(),
  periodMonths: z.int().min(1).max(12),
  previousSpent: z.number(),
  subcategoryId: z.int(),
  type: z.literal("budgetChange"),
});

export type BudgetChangeItem = z.infer<typeof budgetChangeItemSchema>;

const actionItemsSchema = z.object({
  aboveAverage: z.array(aboveAverageItemSchema),
  improved: z.array(budgetChangeItemSchema),
  overBudget: z.array(overBudgetItemSchema),
  worsened: z.array(budgetChangeItemSchema),
});

export type ActionItems = z.infer<typeof actionItemsSchema>;
export type ActionItem = AboveAverageItem | BudgetChangeItem | OverBudgetItem;

const budgetBreakdownItemSchema = z.object({
  budgetAmountCents: z.int().nonnegative(),
  budgetFrequency: z.int().min(1).max(12),
  budgetType: budgetTypeSchema,
  currentPeriodSpent: z.number(),
  previousPeriodSpent: z.number(),
  subcategoryId: z.int(),
});

export type BudgetBreakdownItem = z.infer<typeof budgetBreakdownItemSchema>;

export const getBudgetQuerySchema = z.object({
  endMonth: z.string().min(1).max(2),
  endYear: z.string().min(4).max(4),
});

export type GetBudgetQuery = z.infer<typeof getBudgetQuerySchema>;

export const getBudgetSummaryResponseSchema = createApiResponseSchema({
  actionItems: actionItemsSchema,
  aiSummary: z.string().nullable(),
  budgetBreakdown: z.array(budgetBreakdownItemSchema),
  quickPulse: quickPulseDataSchema,
});

export type GetBudgetSummaryResponse = z.infer<
  typeof getBudgetSummaryResponseSchema
>;
