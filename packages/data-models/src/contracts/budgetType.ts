import z from "zod";

export const BudgetTypes = ["expense", "income", "neutral"] as const;

export const budgetTypeSchema = z.enum(BudgetTypes);

export type BudgetType = z.infer<typeof budgetTypeSchema>;
