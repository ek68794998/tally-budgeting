import { type NextRequest } from "next/server";
import { type RateLimiterAbstract } from "rate-limiter-flexible";
import { rateLimiterResSchema } from "../thirdParty/rate-limiter-flexible";
import { type RateLimiterResult } from "./types";

export const enforceRateLimitAsync = async (
  rateLimiter: RateLimiterAbstract,
  idOrIp: string,
  points: number,
): Promise<RateLimiterResult> => {
  try {
    const result = await rateLimiter.consume(idOrIp, points);
    return { ...result, shouldThrottle: false };
  } catch (error) {
    const parsedResult = rateLimiterResSchema.safeParse(error);

    if (parsedResult.success) {
      return { ...parsedResult.data, shouldThrottle: true };
    }

    throw error;
  }
};

export const getIpAddress = (req: NextRequest): string | undefined => {
  try {
    const ip = "ip" in req ? String(req.ip) : undefined;

    const forwardedFor = req.headers.get("X-Forwarded-For");
    const realIp = req.headers.get("X-Real-IP");

    return forwardedFor || realIp || ip;
  } catch {
    return undefined;
  }
};
