import z from "zod";
import { categorySchema } from "../category";
import { subcategorySchema } from "../subcategory";

export const getCategoriesResponseSchema = z.object({
	categories: z.array(categorySchema),
	subcategories: z.array(subcategorySchema),
});

export type GetCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>;
