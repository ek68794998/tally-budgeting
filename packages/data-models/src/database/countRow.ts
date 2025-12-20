import z from "zod";

export const countRowSchema = z.object({
	count: z.number().min(0),
});
