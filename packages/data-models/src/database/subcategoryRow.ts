import z from "zod";
import { budgetTypeSchema } from "../contracts/budgetType";

export const subcategoryRowSchema = z.object({
	/* eslint-disable @typescript-eslint/naming-convention */
	budget_amount: z.string(),
	budget_frequency_months: z.number().min(1).max(12),
	budget_type: budgetTypeSchema,
	category: z.number().int(),
	description: z.string().nullable(),
	id: z.number().int(),
	label: z.string().min(2).max(100),
	/* eslint-enable @typescript-eslint/naming-convention */
});

export type SubcategoryRow = z.infer<typeof subcategoryRowSchema>;
