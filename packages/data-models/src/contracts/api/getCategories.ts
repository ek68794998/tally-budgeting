import z from "zod";
import { categorySchema } from "../category";
import { subcategorySchema } from "../subcategory";
import { createApiResponseSchema } from "./types";

export const getCategoriesResponseSchema = createApiResponseSchema({
	categories: z.array(categorySchema),
	subcategories: z.array(subcategorySchema),
});

export type GetCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>;
