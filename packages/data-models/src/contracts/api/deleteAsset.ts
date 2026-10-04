import z from "zod";

export const deleteAssetParamsSchema = z.object({
  id: z.string(),
});

export type DeleteAssetParams = z.infer<typeof deleteAssetParamsSchema>;

export const deleteAssetResponseSchema = z.unknown();

export type DeleteAssetResponse = z.infer<typeof deleteAssetResponseSchema>;
