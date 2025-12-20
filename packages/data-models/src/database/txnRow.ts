import z from "zod";
import { transactionDirectionSchema } from "../contracts/transactionDirection";

export const transactionSortFields = [
	"account",
	"amount",
	"category",
	"date",
	"merchant",
] as const satisfies string[];

export const txnRowSchema = z.object({
	account: z.number().int().nullable(),
	amount: z.string(),
	category: z.number().int(),
	date: z.date(),
	direction: transactionDirectionSchema,
	id: z.int(),
	merchant: z.string(),
	notes: z.string().nullable(),
	subcategory: z.number().int(),
});

export type TxnRow = z.infer<typeof txnRowSchema>;
