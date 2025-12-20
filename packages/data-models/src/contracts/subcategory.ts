import z from "zod";
import { budgetTypeSchema } from "./budgetType";
import { DefaultCategoryId } from "./category";

export const subcategorySchema = z.object({
	budget: z.object({
		amount: z.number().min(0),
		frequency: z.number().min(1).max(12),
		type: budgetTypeSchema,
	}),
	categoryId: z.number(),
	description: z.string(),
	id: z.number(),
	label: z.string().min(1).max(100),
});

export type Subcategory = z.infer<typeof subcategorySchema>;

export const DefaultSubcategoryId = -1;

export const DefaultSubcategory: Subcategory = {
	budget: {
		amount: 0,
		frequency: 12,
		type: "expense",
	},
	categoryId: DefaultCategoryId,
	description: "",
	id: DefaultSubcategoryId,
	label: "Uncategorized",
};
