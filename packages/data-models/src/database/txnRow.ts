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
	/* eslint-disable @typescript-eslint/naming-convention */
	account: z.int().nullable(),
	amount_cents: z.int(),
	category: z.int(),
	date: z.date(),
	direction: transactionDirectionSchema,
	id: z.int().positive(),
	merchant: z.string().min(1).max(100),
	notes: z.string().nullable(),
	subcategory: z.int(),
	/* eslint-enable @typescript-eslint/naming-convention */
});

export type TxnRow = z.infer<typeof txnRowSchema>;
