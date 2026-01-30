import z from "zod";

export const deleteTransactionParamsSchema = z.object({
	id: z.string(),
});

export type DeleteTransactionParams = z.infer<
	typeof deleteTransactionParamsSchema
>;

export const deleteTransactionResponseSchema = z.unknown();

export type DeleteTransactionResponse = z.infer<
	typeof deleteTransactionResponseSchema
>;
