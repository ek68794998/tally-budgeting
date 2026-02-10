import { type NextRequest, type NextResponse } from "next/server";
import type z from "zod";
import { type rateLimiterResSchema } from "../thirdParty/rate-limiter-flexible";

export type NextResponseFn = (
	request: NextRequest,
	context: { params: Promise<unknown> },
) => Promise<NextResponse>;

export type RateLimiterResult = z.infer<typeof rateLimiterResSchema> & {
	shouldThrottle: boolean;
};
