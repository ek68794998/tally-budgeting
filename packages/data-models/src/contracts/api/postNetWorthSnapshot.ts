import z from "zod";
import { netWorthSnapshotSchema } from "../netWorthSnapshot";

export const postNetWorthSnapshotRequestSchema = z.object({
	snapshot: netWorthSnapshotSchema,
});

export type PostNetWorthSnapshotRequest = z.infer<
	typeof postNetWorthSnapshotRequestSchema
>;

export const postNetWorthSnapshotResponseSchema = z.object({
	success: z.boolean(),
});

export type PostNetWorthSnapshotResponse = z.infer<
	typeof postNetWorthSnapshotResponseSchema
>;
