import z from "zod";
import { budgetTypeSchema } from "../contracts/budgetType";

export const subcategoryRowSchema = z.object({
	/* eslint-disable @typescript-eslint/naming-convention */
	budget_amount_cents: z.string() /* BIGINT -> string */,
	budget_frequency_months: z.int().min(1).max(12),
	budget_type: budgetTypeSchema,
	category: z.int(),
	description: z.string().nullable(),
	id: z.int(),
	label: z.string().min(2).max(100),
	pct_needs: z.int().min(0).max(100),
	pct_savings: z.int().min(0).max(100),
	/* eslint-enable @typescript-eslint/naming-convention */
});

export type SubcategoryRow = z.infer<typeof subcategoryRowSchema>;
