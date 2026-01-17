import z from "zod";
import { netWorthSnapshotSchema } from "../netWorthSnapshot";
import { createApiResponseSchema } from "./types";

export const postNetWorthSnapshotRequestSchema = z.object({
	snapshot: netWorthSnapshotSchema,
});

export type PostNetWorthSnapshotRequest = z.infer<
	typeof postNetWorthSnapshotRequestSchema
>;

export const postNetWorthSnapshotResponseSchema = createApiResponseSchema({});

export type PostNetWorthSnapshotResponse = z.infer<
	typeof postNetWorthSnapshotResponseSchema
>;
