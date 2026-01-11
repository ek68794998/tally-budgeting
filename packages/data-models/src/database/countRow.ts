import z from "zod";

export const countRowSchema = z.object({
	count: z
		.union([z.string(), z.int(), z.bigint()])
		.pipe(z.transform((val) => Number(val))),
});
