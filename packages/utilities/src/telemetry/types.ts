import {
	eventLogDataSchema,
	eventLogLevelSchema,
	eventSourceSchema,
} from "@tally/data-models/contracts/api/postEvents";
import { httpHeadersSchema } from "@tally/data-models/http/headers";
import z from "zod";

export const eventLogEntrySchema = z.object({
	data: eventLogDataSchema.optional(),
	event: z.string(),
	level: eventLogLevelSchema,
	source: eventSourceSchema,
	timestamp: z.string(),
});

export type EventLogEntry = z.infer<typeof eventLogEntrySchema>;

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
