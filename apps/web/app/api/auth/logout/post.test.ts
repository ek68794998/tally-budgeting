import { describe, expect, it, vi } from "vitest";
import { SessionCookieName } from "../../../auth/cookie";
import { callRouteAsync } from "../../testing/routeTesting";
import { PostLogoutRouteAsync } from "./post";

const cookieDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ delete: cookieDelete })),
}));

vi.mock(
  "../../../telemetry/telemetry",
  async () =>
    (await import("../../testing/routeTesting")).silentTelemetryModule,
);

describe("PostLogoutRouteAsync", () => {
  it("clears the session cookie without requiring authentication", async () => {
    const { status } = await callRouteAsync(PostLogoutRouteAsync, {
      method: "POST",
    });

    expect(status).toBe(204);
    expect(cookieDelete).toHaveBeenCalledWith(SessionCookieName);
  });
});
