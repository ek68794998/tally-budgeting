import z from "zod";

export const deleteCategoryParamsSchema = z.object({
	id: z.string(),
});

export type DeleteCategoryParams = z.infer<typeof deleteCategoryParamsSchema>;

export const deleteCategoryResponseSchema = z.unknown();

export type DeleteCategoryResponse = z.infer<
	typeof deleteCategoryResponseSchema
>;
