import { NoContent } from "@ekumlin/typescript-toolkit/http";
import { unreachable } from "@ekumlin/typescript-toolkit/values";
import { postEventsRequestSchema } from "@tally/data-models/contracts/api/postEvents";
import z from "zod";
import { telemetry } from "../../telemetry/telemetry";
import { createApiHandler } from "../handlers/createApiHandler";
import type { NextResponseFn } from "../types";

export const PostEventsRouteAsync: NextResponseFn = createApiHandler({
	eventName: "POST:EVENTS",
	handler: ({ body }) => {
		for (const entry of body.events) {
			switch (entry.level) {
				case "error":
					telemetry().error(entry.event, entry.data);
					break;
				case "warn":
					telemetry().warn(entry.event, entry.data);
					break;
				case "info":
					telemetry().info(entry.event, entry.data);
					break;
				case "debug":
					telemetry().debug(entry.event, entry.data);
					break;
				case "http":
					telemetry().info(entry.event, entry.data);
					break;
				default:
					unreachable(entry.level);
			}
		}

		return Promise.resolve({ statusCode: NoContent });
	},
	schemata: {
		body: postEventsRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
