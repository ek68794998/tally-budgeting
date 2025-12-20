import z from "zod";

export const transactionSortFields = [
	"account",
	"amount",
	"category",
	"date",
	"merchant",
] as const satisfies string[];

export const transactionRowSchema = z.object({
	accountId: z.number(),
	amountCents: z.int(),
	categoryId: z.number(),
	dateIso: z.iso.datetime({ offset: true }),
	direction: z.int(),
	id: z.int(),
	merchant: z.string(),
	notes: z.string().nullable(),
	subcategoryId: z.number(),
});

export type TransactionRow = z.infer<typeof transactionRowSchema>;
