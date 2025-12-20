import z from "zod";

export const subcategoryRowSchema = z.object({
	budgetAmountCents: z.number().min(0),
	budgetFrequencyMonths: z.number().min(1).max(12),
	budgetType: z.number(),
	category: z.number(),
	description: z.string().nullable(),
	id: z.number(),
	label: z.string().min(2).max(100),
});

export type SubcategoryRow = z.infer<typeof subcategoryRowSchema>;
