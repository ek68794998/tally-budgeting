import z from "zod";
import { happinessLevelSchema } from "./happinessLevel";
import { transactionDirectionSchema } from "./transactionDirection";

export const transactionSchema = z.object({
	accountId: z.number().optional(),
	amountCents: z.int().nonnegative(),
	categoryId: z.number(),
	date: z.iso.datetime({ offset: true }),
	happiness: happinessLevelSchema,
	id: z.int(),
	merchant: z.string().min(1).max(100),
	notes: z.string(),
	subcategoryId: z.number(),
	type: transactionDirectionSchema,
});

export type Transaction = z.infer<typeof transactionSchema>;

export const transactionFieldsSchema = z.strictObject(
	transactionSchema.omit({ id: true }).shape,
);

export type TransactionFields = z.infer<typeof transactionFieldsSchema>;
