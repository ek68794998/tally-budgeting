import { NoContent, TooManyRequests } from "@ekumlin/typescript-toolkit/http";
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
			telemetry().event(entry);
		}

		return { statusCode: NoContent };
	},
	schemata: {
		body: postEventsRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
