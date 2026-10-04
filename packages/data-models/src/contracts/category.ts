import z from "zod";

export const categorySchema = z.object({
  id: z.int(),
  label: z.string().min(2).max(100),
});

export const DefaultCategoryId = -1;

export type Category = z.infer<typeof categorySchema>;

export const categoryFieldsSchema = z.strictObject(
  categorySchema.omit({ id: true }).shape,
);

export type CategoryFields = z.infer<typeof categoryFieldsSchema>;
