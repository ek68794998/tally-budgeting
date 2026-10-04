import z from "zod";

export const appSettingRowSchema = z.object({
  key: z.string().min(1),
  value: z.json(),
});

export type AppSettingRow = z.infer<typeof appSettingRowSchema>;
