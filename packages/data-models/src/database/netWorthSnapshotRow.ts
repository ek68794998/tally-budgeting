import z from "zod";

export const netWorthSnapshotRowSchema = z.object({
	date: z.date(),
	id: z.int(),
	value_cents: z.string() /* BIGINT -> string */, // eslint-disable-line @typescript-eslint/naming-convention
});

export type NetWorthSnapshotRow = z.infer<typeof netWorthSnapshotRowSchema>;
