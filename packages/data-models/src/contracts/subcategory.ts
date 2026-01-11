import z from "zod";
import { budgetTypeSchema } from "./budgetType";
import { DefaultCategoryId } from "./category";

export const subcategorySchema = z.object({
	budget: z.object({
		amountCents: z.int().nonnegative(),
		frequency: z.int().min(1).max(12),
		type: budgetTypeSchema,
	}),
	categoryId: z.int(),
	description: z.string(),
	id: z.int(),
	label: z.string().min(2).max(100),
});

export type Subcategory = z.infer<typeof subcategorySchema>;

export const DefaultSubcategoryId = -1;

export const DefaultSubcategory: Subcategory = {
	budget: {
		amountCents: 0,
		frequency: 12,
		type: "expense",
	},
	categoryId: DefaultCategoryId,
	description: "",
	id: DefaultSubcategoryId,
	label: "Uncategorized",
};
