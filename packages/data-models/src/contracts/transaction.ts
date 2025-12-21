import z from "zod";
import { transactionDirectionSchema } from "./transactionDirection";

export const transactionSchema = z.object({
	accountId: z.number().optional(),
	amountCents: z.int().nonnegative(),
	categoryId: z.number(),
	date: z.iso.datetime({ offset: true }),
	id: z.int().positive(),
	merchant: z.string().min(1).max(100),
	notes: z.string(),
	subcategoryId: z.number(),
	type: transactionDirectionSchema,
});

export type Transaction = z.infer<typeof transactionSchema>;
