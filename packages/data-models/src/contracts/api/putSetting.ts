import z from "zod";
import { databaseSettingKeySchema } from "../../settings/settingDefinitions";
import { createApiResponseSchema } from "./types";

export const putSettingParamsSchema = z.object({
	key: databaseSettingKeySchema,
});

export type PutSettingParams = z.infer<typeof putSettingParamsSchema>;

export const putSettingRequestSchema = z.object({
	value: z.json(),
});

export type PutSettingRequest = z.infer<typeof putSettingRequestSchema>;

export const putSettingResponseSchema = createApiResponseSchema({});

export type PutSettingResponse = z.infer<typeof putSettingResponseSchema>;
