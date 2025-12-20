import z from "zod";
import { transactionSchema } from "../transaction";

export const postTransactionsUploadResponseSchema = z.object({
	rowsFailed: z.array(z.tuple([z.string(), z.unknown()])),
	rowsIgnored: z.array(z.unknown()),
	rowsProcessed: z.array(transactionSchema),
});

export type PostTransactionsUploadResponse = z.infer<
	typeof postTransactionsUploadResponseSchema
>;
