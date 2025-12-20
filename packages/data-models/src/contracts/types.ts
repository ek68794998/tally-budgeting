import z from "zod";

export const sortDirectionSchema = z.enum(["ascending", "descending"] as const);

export type SortDirection = z.infer<typeof sortDirectionSchema>;

export const withNextLinkSchema = z.object({
	nextLink: z.url().optional(),
});
