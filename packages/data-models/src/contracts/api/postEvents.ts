import z from "zod";

export const eventLogDataSchema = z
	.object({
		message: z.string().optional(),
	})
	.loose();

export type EventLogData = z.infer<typeof eventLogDataSchema>;

export const eventLogLevelSchema = z.enum([
	"error",
	"warn",
	"info",
	"debug",
	"http",
]);

export type EventLogLevel = z.infer<typeof eventLogLevelSchema>;

export const eventSourceSchema = z.enum(["FRONTEND", "BACKEND"]);

export type EventSource = z.infer<typeof eventSourceSchema>;

export const eventLogEntrySchema = z.object({
	data: eventLogDataSchema.optional(),
	event: z.string(),
	level: eventLogLevelSchema,
	source: eventSourceSchema,
	timestamp: z.string(),
});

export type EventLogEntry = z.infer<typeof eventLogEntrySchema>;

export const postEventsRequestSchema = z.object({
	events: z.array(eventLogEntrySchema),
});

export type PostEventsRequest = z.infer<typeof postEventsRequestSchema>;
