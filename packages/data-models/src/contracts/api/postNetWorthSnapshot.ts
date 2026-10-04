import z from "zod";
import { netWorthSnapshotFieldsSchema } from "../netWorthSnapshot";
import { createApiResponseSchema } from "./types";

export const postNetWorthSnapshotRequestSchema = z.object({
	snapshot: netWorthSnapshotFieldsSchema,
});

export type PostNetWorthSnapshotRequest = z.infer<
	typeof postNetWorthSnapshotRequestSchema
>;

export const postNetWorthSnapshotResponseSchema = createApiResponseSchema({});

export type PostNetWorthSnapshotResponse = z.infer<
	typeof postNetWorthSnapshotResponseSchema
>;
