import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetAuthConfigForTesting } from "./app/auth/config";
import { SessionCookieName } from "./app/auth/cookie";
import { createSessionToken, SessionTtlSeconds } from "./app/auth/session";
import { getOrCreateSessionSecretAsync } from "./app/storage/appSettingsClient";
import { config, proxy } from "./proxy";

const secret = "test-secret";

vi.mock("./app/storage/appSettingsClient", () => ({
  getOrCreateSessionSecretAsync: vi.fn(() => Promise.resolve(secret)),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const buildRequest = (token?: string) =>
  new NextRequest("http://localhost/assets?tab=1", {
    headers: token ? { cookie: `${SessionCookieName}=${token}` } : {},
  });

const validToken = () =>
  createSessionToken({ now: new Date(), password: "pw", secret });

describe("proxy", () => {
  beforeEach(() => {
    vi.stubEnv("APP_PASSWORD", "pw");
    vi.stubEnv("DANGEROUSLY_DISABLE_AUTH", "");
    resetAuthConfigForTesting();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetAuthConfigForTesting();
  });

  it("redirects to login with the original path as next", async () => {
    const response = await proxy(buildRequest());

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?next=%2Fassets%3Ftab%3D1",
    );
  });

  it("passes a valid, fresh cookie through without re-issuing it", async () => {
    const token = createSessionToken({
      now: new Date(),
      password: "pw",
      secret,
    });

    const response = await proxy(buildRequest(token));

    expect(response.headers.get("location")).toBeNull();
    expect(response.cookies.get(SessionCookieName)).toBeUndefined();
  });

  it("re-issues the cookie once less than half the lifetime remains", async () => {
    const issuedAt = new Date(Date.now() - SessionTtlSeconds * 1000 * 0.75);
    const token = createSessionToken({
      now: issuedAt,
      password: "pw",
      secret,
    });

    const response = await proxy(buildRequest(token));

    const refreshed = response.cookies.get(SessionCookieName);
    expect(refreshed?.value).toBeTruthy();
    expect(refreshed?.value).not.toBe(token);
  });

  it("responds 503 when the database is unavailable", async () => {
    vi.mocked(getOrCreateSessionSecretAsync).mockRejectedValueOnce(
      new Error("Connection terminated due to connection timeout"),
    );

    const response = await proxy(buildRequest(validToken()));

    expect(response.status).toBe(503);
  });

  it("rethrows other session secret failures", async () => {
    const error = new Error("boom");
    vi.mocked(getOrCreateSessionSecretAsync).mockRejectedValueOnce(error);

    await expect(proxy(buildRequest(validToken()))).rejects.toBe(error);
  });

  it("passes everything through when auth is disabled", async () => {
    vi.stubEnv("DANGEROUSLY_DISABLE_AUTH", "1");
    resetAuthConfigForTesting();

    const response = await proxy(buildRequest());

    expect(response.headers.get("location")).toBeNull();
  });

  describe("matcher", () => {
    const matcherRegex = new RegExp(`^${config.matcher[0]}$`);

    it.each([
      "/favicon.ico",
      "/favicon.svg",
      "/favicon-16x16.png",
      "/apple-touch-icon.png",
      "/android-chrome-192x192.png",
      "/site.webmanifest",
      "/login",
      "/api/health",
    ])("exempts %s from auth", (path) => {
      expect(matcherRegex.test(path)).toBe(false);
    });

    it.each([
      "/",
      "/assets",
      "/favicon-x/anything.png",
      "/site.webmanifest-anything",
      "/nested/favicon.ico",
    ])("protects %s", (path) => {
      expect(matcherRegex.test(path)).toBe(true);
    });
  });
});
