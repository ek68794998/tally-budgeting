import z from "zod";
import { accountProviderTypeSchema } from "../accountProviderType";
import { createApiResponseSchema } from "./types";

export const getSettingsResponseSchema = createApiResponseSchema({
  settings: z.object({
    providersHidden: z.array(accountProviderTypeSchema),
  }),
});

export type GetSettingsResponse = z.infer<typeof getSettingsResponseSchema>;
