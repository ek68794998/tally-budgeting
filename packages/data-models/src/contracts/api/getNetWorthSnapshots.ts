import z from "zod";
import { netWorthSnapshotSchema } from "../netWorthSnapshot";
import { createApiResponseSchema } from "./types";

export const getNetWorthSnapshotsResponseSchema = createApiResponseSchema({
	snapshots: z.array(netWorthSnapshotSchema),
});

export type GetNetWorthSnapshotsResponse = z.infer<
	typeof getNetWorthSnapshotsResponseSchema
>;
