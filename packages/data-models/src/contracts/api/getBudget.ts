import z from "zod";

export const getBudgetParamsSchema = z.object({
	endMonth: z.string().min(1).max(2),
	endYear: z.string().min(4).max(4),
	months: z.string().min(1).max(2),
});

export type GetBudgetParams = z.infer<typeof getBudgetParamsSchema>;

export const getBudgetResponseSchema = z.object({
	bySubcategory: z.array(
		z.object({
			spent: z.number(),
			subcategoryId: z.number(),
		}),
	),
	summary: z.object({
		annualIncome: z.number(),
		annualSpent: z.number(),
		budgeted: z.number().min(0),
		income: z.number(),
		spent: z.number(),
	}),
});

export type GetBudgetResponse = z.infer<typeof getBudgetResponseSchema>;
