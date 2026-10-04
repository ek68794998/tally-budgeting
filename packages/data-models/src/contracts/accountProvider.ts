import z from "zod";
import { accountProviderTypeSchema } from "./accountProviderType";

export const accountProviderSchema = z.object({
  id: accountProviderTypeSchema.nullable(),
  name: z.string(),
});

export type AccountProvider = z.infer<typeof accountProviderSchema>;
