import { dangerouslyMockPartial } from "@ekumlin/typescript-toolkit/testing";
import { render } from "@testing-library/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isAuthenticatedAsync } from "../auth/verifyRequest";
import { LoginCard } from "./loginCard";
import LoginPage from "./page";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("../auth/verifyRequest", () => ({ isAuthenticatedAsync: vi.fn() }));
vi.mock("./loginCard", () => ({
  LoginCard: vi.fn(() => <div data-testid="login-card" />),
}));

const renderPageAsync = async (next?: string | string[]) => {
  render(await LoginPage({ searchParams: Promise.resolve({ next }) }));
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue(
      dangerouslyMockPartial<Awaited<ReturnType<typeof cookies>>>({
        get: () => ({ name: "tally_session", value: "token" }),
      }),
    );
  });

  it.each([
    { expected: "/budget", next: ["/budget", "/assets"] },
    { expected: undefined, next: undefined },
  ])("shows the login card with next=$expected when signed out", async ({
    expected,
    next,
  }) => {
    vi.mocked(isAuthenticatedAsync).mockResolvedValue(false);

    await renderPageAsync(next);

    expect(isAuthenticatedAsync).toHaveBeenCalledWith("token");
    expect(vi.mocked(LoginCard).mock.lastCall?.[0]).toEqual({
      next: expected,
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects signed-in users to a safe path", async () => {
    vi.mocked(isAuthenticatedAsync).mockResolvedValue(true);

    await renderPageAsync("/assets");

    expect(redirect).toHaveBeenCalledWith("/assets");
  });
});
