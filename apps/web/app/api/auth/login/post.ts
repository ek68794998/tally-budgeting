import {
  NoContent,
  TooManyRequests,
  Unauthorized,
} from "@ekumlin/typescript-toolkit/http";
import { postLoginRequestSchema } from "@tally/data-models/contracts/api/postLogin";
import { cookies } from "next/headers";
import { RateLimiterMemory } from "rate-limiter-flexible";
import z from "zod";
import { getAuthConfig } from "../../../auth/config";
import {
  getSessionCookieOptions,
  SessionCookieName,
} from "../../../auth/cookie";
import { isPasswordCorrect } from "../../../auth/password";
import { createSessionToken } from "../../../auth/session";
import { getOrCreateSessionSecretAsync } from "../../../storage/appSettingsClient";
import { telemetry } from "../../../telemetry/telemetry";
import { createApiHandler } from "../../handlers/createApiHandler";
import { type ApiResult } from "../../handlers/types";
import { type NextResponseFn } from "../../types";

const failureDelayMilliseconds = 300;
const globalKey = "global";

const perIpFailureLimiter = new RateLimiterMemory({
  duration: 15 * 60,
  points: 5,
});

// The IP comes from spoofable headers, so this backstop is what actually
// bounds brute force.
const globalFailureLimiter = new RateLimiterMemory({
  duration: 60 * 60,
  points: 50,
});

const isExhaustedAsync = async (
  limiter: RateLimiterMemory,
  key: string,
): Promise<boolean> => {
  const result = await limiter.get(key);

  return !!result && result.remainingPoints <= 0;
};

const recordFailureAsync = async (
  limiter: RateLimiterMemory,
  key: string,
): Promise<void> => {
  try {
    await limiter.consume(key);
  } catch {
    // Exhausting the limiter is what we want; later attempts are blocked.
  }
};

const delayAsync = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export const PostLoginRouteAsync: NextResponseFn = createApiHandler({
  access: "public",
  eventName: "POST:AUTH:LOGIN",
  handler: async ({ body, ip }, request): Promise<ApiResult<never>> => {
    const config = getAuthConfig();

    if (config.mode === "disabled") {
      return { statusCode: NoContent };
    }

    if (
      (await isExhaustedAsync(perIpFailureLimiter, ip)) ||
      (await isExhaustedAsync(globalFailureLimiter, globalKey))
    ) {
      telemetry().warn("AUTH_LOGIN_RATE_LIMITED", { ip });

      return {
        error: { code: "http429", params: {} },
        statusCode: TooManyRequests,
      };
    }

    if (!isPasswordCorrect(body.password, config.password)) {
      await recordFailureAsync(perIpFailureLimiter, ip);
      await recordFailureAsync(globalFailureLimiter, globalKey);
      await delayAsync(failureDelayMilliseconds);

      telemetry().warn("AUTH_LOGIN_FAILED", { ip });

      return {
        error: { code: "invalidPassword", params: {} },
        statusCode: Unauthorized,
      };
    }

    const secret = await getOrCreateSessionSecretAsync();
    const token = createSessionToken({
      now: new Date(),
      password: config.password,
      secret,
    });

    const cookieStore = await cookies();
    cookieStore.set(SessionCookieName, token, getSessionCookieOptions(request));

    return { statusCode: NoContent };
  },
  schemata: {
    body: postLoginRequestSchema,
    params: z.unknown(),
    query: z.unknown(),
  },
});
