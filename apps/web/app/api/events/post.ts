import { NoContent, TooManyRequests } from "@ekumlin/typescript-toolkit/http";
import { unreachable } from "@ekumlin/typescript-toolkit/values";
import { postEventsRequestSchema } from "@tally/data-models/contracts/api/postEvents";
import { RateLimiterMemory } from "rate-limiter-flexible";
import z from "zod";
import { telemetry } from "../../telemetry/telemetry";
import { createApiHandler } from "../handlers/createApiHandler";
import { enforceRateLimitAsync } from "../helpers";
import type { NextResponseFn } from "../types";

const rateLimiter = new RateLimiterMemory({
	duration: 10,
	points: 100,
});

export const PostEventsRouteAsync: NextResponseFn = createApiHandler({
	eventName: "POST:EVENTS",
	handler: async ({ body, ip }) => {
		const rateLimiterResult = await enforceRateLimitAsync(
			rateLimiter,
			ip,
			body.events.length,
		);

		if (rateLimiterResult.shouldThrottle) {
			return { statusCode: TooManyRequests };
		}

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

		return { statusCode: NoContent };
	},
	schemata: {
		body: postEventsRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
