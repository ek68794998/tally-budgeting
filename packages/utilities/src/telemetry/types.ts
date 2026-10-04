import { httpHeadersSchema } from "@tally/data-models/http/headers";
import z from "zod";

export const httpIncomingDataSchema = z.object({
  error: z.unknown().optional(),
  headers: httpHeadersSchema.optional(),
  method: z.string(),
  path: z.string(),
  statusCode: z.number(),
});

export type HttpIncomingData = z.infer<typeof httpIncomingDataSchema>;

export const httpOutgoingDataSchema = z.object({
  error: z.unknown().optional(),
  headers: httpHeadersSchema.optional(),
  method: z.string(),
  statusCode: z.number().optional(),
  url: z.string(),
});

export type HttpOutgoingData = z.infer<typeof httpOutgoingDataSchema>;
