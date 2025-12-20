import z from "zod";

export const budgetTypeSchema = z.enum(["expense", "income", "neutral"]);

export type BudgetType = z.infer<typeof budgetTypeSchema>;

export const BudgetTypes = {
	expense: 2,
	income: 1,
	neutral: 0,
} as const satisfies Record<BudgetType, number>;
