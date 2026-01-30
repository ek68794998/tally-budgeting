import z from "zod";

export const deleteSubcategoryParamsSchema = z.object({
	id: z.string(),
});

export type DeleteSubcategoryParams = z.infer<
	typeof deleteSubcategoryParamsSchema
>;

export const deleteSubcategoryResponseSchema = z.unknown();

export type DeleteSubcategoryResponse = z.infer<
	typeof deleteSubcategoryResponseSchema
>;
