import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetAuthConfigForTesting } from "../../../auth/config";
import { SessionCookieName } from "../../../auth/cookie";
import { PostLoginRouteAsync } from "./post";

const cookieSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: cookieSet })),
}));

vi.mock("../../../storage/appSettingsClient", () => ({
  getOrCreateSessionSecretAsync: vi.fn(() => Promise.resolve("test-secret")),
}));

vi.mock("../../../telemetry/telemetry", () => ({
  telemetry: () => ({
    error: vi.fn(),
    httpIncoming: () => ({ end: vi.fn() }),
    warn: vi.fn(),
  }),
}));

const loginAsync = (password: string, ip: string) =>
  PostLoginRouteAsync(
    new NextRequest("http://localhost/api/auth/login", {
      body: JSON.stringify({ password }),
      headers: new Headers([
        ["host", "localhost"],
        ["x-forwarded-for", ip],
      ]),
      method: "POST",
    }),
    { params: Promise.resolve({}) },
  );

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("APP_PASSWORD", "correct");
    vi.stubEnv("DANGEROUSLY_DISABLE_AUTH", "");
    resetAuthConfigForTesting();
  });

  it("sets the session cookie and responds 204 for the right password", async () => {
    const response = await loginAsync("correct", "198.51.100.1");

    expect(response.status).toBe(204);
    expect(cookieSet).toHaveBeenCalledWith(
      SessionCookieName,
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it("responds 401 invalidPassword and sets no cookie for a wrong password", async () => {
    const response = await loginAsync("wrong", "198.51.100.2");

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      error: { code: "invalidPassword" },
    });
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it("responds 429 after repeated failures from one IP, even with the right password", async () => {
    const ip = "198.51.100.3";

    for (let i = 0; i < 5; i++) {
      expect((await loginAsync("wrong", ip)).status).toBe(401);
    }

    expect((await loginAsync("correct", ip)).status).toBe(429);
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it("rejects a missing password with 400", async () => {
    const response = await PostLoginRouteAsync(
      new NextRequest("http://localhost/api/auth/login", {
        body: JSON.stringify({}),
        headers: new Headers([["host", "localhost"]]),
        method: "POST",
      }),
      { params: Promise.resolve({}) },
    );

    expect(response.status).toBe(400);
  });
});
