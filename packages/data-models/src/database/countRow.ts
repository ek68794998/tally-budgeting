import z from "zod";

export const countRowSchema = z.object({
	count: z.int().nonnegative(),
});
