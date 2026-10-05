import { dangerouslyMockPartial } from "@ekumlin/typescript-toolkit/testing";
import { LoginForm } from "@tally/ui/auth/loginForm";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { LoginCard } from "./loginCard";

vi.mock("@tally/ui/auth/loginForm", () => ({
  LoginForm: vi.fn(() => <div data-testid="login-form" />),
}));
vi.mock("@tally/ui/sidebar/sidebarLogo", () => ({
  SidebarLogo: vi.fn(() => <div data-testid="logo" />),
}));
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));

describe("LoginCard", () => {
  it.each([
    { expected: "/budget", next: "/budget" },
    { expected: "/", next: "https://evil.example" },
    { expected: "/", next: undefined },
  ])("redirects to $expected after logging in with next=$next", ({
    expected,
    next,
  }) => {
    const router = { refresh: vi.fn(), replace: vi.fn() };
    vi.mocked(useRouter).mockReturnValue(
      dangerouslyMockPartial<ReturnType<typeof useRouter>>(router),
    );

    render(<LoginCard next={next} />);
    vi.mocked(LoginForm).mock.lastCall?.[0].onSuccess();

    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith(expected);
    expect(router.refresh).toHaveBeenCalledOnce();
  });
});
