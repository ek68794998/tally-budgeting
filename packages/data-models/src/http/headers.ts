import z from "zod";

export const httpHeadersSchema = z.record(z.string(), z.unknown());

export type HttpHeaders = z.infer<typeof httpHeadersSchema>;
