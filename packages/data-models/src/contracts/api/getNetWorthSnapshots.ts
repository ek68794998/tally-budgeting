import z from "zod";
import { netWorthSnapshotSchema } from "../netWorthSnapshot";

export const getNetWorthSnapshotsResponseSchema = z.object({
	snapshots: z.array(netWorthSnapshotSchema),
});

export type GetNetWorthSnapshotsResponse = z.infer<
	typeof getNetWorthSnapshotsResponseSchema
>;
