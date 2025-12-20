import z from "zod";

export const transactionDirectionSchema = z.enum(["debit", "credit"]);

export type TransactionDirection = z.infer<typeof transactionDirectionSchema>;

export const TransactionDirections = {
	credit: 1,
	debit: 0,
} as const satisfies Record<TransactionDirection, number>;
