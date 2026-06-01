import z from "zod";

export const accountProviderTypeSchema = z.enum([
	"apple",
	"chase",
	"fidelity",
	"firstTechFederal",
	"guideline",
	"rippling",
	"robinhood",
	"vestwell",
]);

export type AccountProviderType = z.infer<typeof accountProviderTypeSchema>;
