import z from "zod";
import { transactionSchema } from "../transaction";
import { createApiResponseSchema } from "./types";

export const postTransactionRequestSchema = z.object({
	transaction: transactionSchema,
});

export type PostTransactionRequest = z.infer<
	typeof postTransactionRequestSchema
>;

export const postTransactionResponseSchema = createApiResponseSchema({});

export type PostTransactionResponse = z.infer<
	typeof postTransactionResponseSchema
>;
