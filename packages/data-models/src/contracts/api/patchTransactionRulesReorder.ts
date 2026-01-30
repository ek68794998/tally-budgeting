import z from "zod";

export const patchTransactionRulesReorderRequestSchema = z.object({
	ruleIds: z.array(z.number().int()),
});

export type PatchTransactionRulesReorderRequest = z.infer<
	typeof patchTransactionRulesReorderRequestSchema
>;

export const patchTransactionRulesReorderResponseSchema = z.unknown();

export type PatchTransactionRulesReorderResponse = z.infer<
	typeof patchTransactionRulesReorderResponseSchema
>;
