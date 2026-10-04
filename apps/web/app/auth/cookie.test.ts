import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./cookie";

const buildRequest = (url: string, forwardedProto?: string) => ({
  headers: new Headers(
    forwardedProto ? [["x-forwarded-proto", forwardedProto]] : [],
  ),
  url,
});

describe("getSessionCookieOptions", () => {
  it.each([
    ["http://localhost/", undefined, false],
    ["https://example.com/", undefined, true],
    ["http://localhost/", "https", true],
    ["http://localhost/", "https, http", true],
    ["https://example.com/", "http", false],
  ])("for %s with x-forwarded-proto %s, secure is %s", (url, proto, secure) => {
    expect(getSessionCookieOptions(buildRequest(url, proto))).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure,
    });
  });
});
