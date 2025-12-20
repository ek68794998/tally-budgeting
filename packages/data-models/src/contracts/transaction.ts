import z from "zod";
import { transactionDirectionSchema } from "./transactionDirection";

export const transactionSchema = z.object({
	accountId: z.number(),
	amount: z.number().min(0),
	categoryId: z.number(),
	date: z.iso.datetime({ offset: true }),
	id: z.number(),
	merchant: z.string().min(1).max(100),
	notes: z.string().optional(),
	subcategoryId: z.number(),
	type: transactionDirectionSchema,
});

export type Transaction = z.infer<typeof transactionSchema>;
