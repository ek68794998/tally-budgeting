import z from "zod";

export const netWorthSnapshotSchema = z.object({
	date: z.date(),
	id: z.int(),
	valueCents: z.number(),
});

export type NetWorthSnapshot = z.infer<typeof netWorthSnapshotSchema>;
