import z from "zod";
import { createApiResponseSchema } from "./types";

export const patchTransactionRulesReorderRequestSchema = z.object({
	ruleIds: z.array(z.number().int()),
});

export type PatchTransactionRulesReorderRequest = z.infer<
	typeof patchTransactionRulesReorderRequestSchema
>;

export const patchTransactionRulesReorderResponseSchema =
	createApiResponseSchema({});

export type PatchTransactionRulesReorderResponse = z.infer<
	typeof patchTransactionRulesReorderResponseSchema
>;
