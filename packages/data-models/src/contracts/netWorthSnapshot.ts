import z from "zod";

export const netWorthSnapshotSchema = z.object({
	date: z.iso.datetime({ offset: true }),
	id: z.int(),
	valueCents: z.number(),
});

export type NetWorthSnapshot = z.infer<typeof netWorthSnapshotSchema>;
