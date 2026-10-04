import { type RateLimiterRes } from "rate-limiter-flexible";
import z from "zod";

export const rateLimiterResSchema: z.ZodType<
  Omit<RateLimiterRes, "toJSON" | "toString">
> = z.object({
  consumedPoints: z.number().min(0),
  isFirstInDuration: z.boolean(),
  msBeforeNext: z.number().min(0),
  remainingPoints: z.number().min(0),
});
