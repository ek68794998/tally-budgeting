import z from "zod";
import { budgetTypeSchema } from "../contracts/budgetType";

export const subcategoryRowSchema = z.object({
	/* eslint-disable @typescript-eslint/naming-convention */
	budget_amount_cents: z.string(), // BIGINT in Postgres is returned as a string.
	budget_frequency_months: z.int().min(1).max(12),
	budget_type: budgetTypeSchema,
	/* eslint-enable @typescript-eslint/naming-convention */
	category: z.int(),
	description: z.string().nullable(),
	id: z.int(),
	label: z.string().min(2).max(100),
});

export type SubcategoryRow = z.infer<typeof subcategoryRowSchema>;
