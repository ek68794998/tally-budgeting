import z from "zod";

export const HappinessLevelDefault = 2;
export const HappinessLevelMax = 3;
export const HappinessLevelMin = 1;

export const happinessLevelSchema = z
  .int()
  .min(HappinessLevelMin)
  .max(HappinessLevelMax);

export type HappinessLevel = z.infer<typeof happinessLevelSchema>;
