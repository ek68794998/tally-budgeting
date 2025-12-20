import z from "zod";
import { transactionSchema } from "../transaction";

export const postTransactionRequestSchema = z.object({
	transaction: transactionSchema,
});

export type PostTransactionRequest = z.infer<
	typeof postTransactionRequestSchema
>;

export const postTransactionResponseSchema = z.object({
	success: z.boolean(),
});

export type PostTransactionResponse = z.infer<
	typeof postTransactionResponseSchema
>;
