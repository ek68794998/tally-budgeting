import z from "zod";

export const categorySchema = z.object({
	id: z.number(),
	label: z.string().min(1).max(100),
});

export const DefaultCategoryId = -1;

export type Category = z.infer<typeof categorySchema>;
