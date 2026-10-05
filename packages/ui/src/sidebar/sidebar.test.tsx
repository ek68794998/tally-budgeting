import { dangerouslyMockPartial } from "@ekumlin/typescript-toolkit/testing";
import { act, render, screen, waitFor } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../auth/authContext";
import { Sidebar } from "./sidebar";
import { type SidebarAction, SidebarMenuItems } from "./sidebarMenuItems";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));
vi.mock("../auth/authContext", () => ({ useAuth: vi.fn() }));
vi.mock("./sidebarLogo", () => ({
  SidebarLogo: vi.fn(() => <div data-testid="sidebar-logo" />),
}));
vi.mock("./sidebarMenuItems", () => ({
  SidebarMenuItems: vi.fn(() => <div data-testid="sidebar-menu-items" />),
}));

const router = { refresh: vi.fn(), replace: vi.fn() };

const lastMenuProps = () => vi.mocked(SidebarMenuItems).mock.lastCall?.[0];

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue("/transactions");
    vi.mocked(useRouter).mockReturnValue(
      dangerouslyMockPartial<ReturnType<typeof useRouter>>(router),
    );
    vi.mocked(useAuth).mockReturnValue({ isAuthEnabled: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks the current page as selected", () => {
    render(<Sidebar className="w-64" />);

    expect(screen.getByTestId("sidebar-logo")).toBeInTheDocument();
    expect(lastMenuProps()?.menuItems).toEqual([
      expect.objectContaining({
        href: "/",
        id: "budget",
        isSelected: false,
      }),
      expect.objectContaining({
        href: "/transactions",
        id: "transactions",
        isSelected: true,
      }),
      expect.objectContaining({ href: "/assets", id: "assets" }),
      expect.objectContaining({ href: "/retirement", id: "retirement" }),
    ]);
  });

  it("logs out and returns to the login page", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 204 })),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<Sidebar />);

    const logout = lastMenuProps()?.footerMenuItems?.find(
      (item): item is SidebarAction => !!item && item.id === "logout",
    );

    act(() => {
      logout?.onPress();
    });

    await waitFor(() => {
      expect(router.refresh).toHaveBeenCalledOnce();
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });
    expect(router.replace).toHaveBeenCalledWith("/login");
    expect(router.refresh).toHaveBeenCalledOnce();
  });

  it("hides logout when auth is disabled and fills the selected settings icon", () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthEnabled: false });
    vi.mocked(usePathname).mockReturnValue("/settings");

    render(<Sidebar />);

    const [settings, logout] = lastMenuProps()?.footerMenuItems ?? [];

    expect(settings).toMatchObject({ id: "settings", isSelected: true });
    expect(logout).toBe(false);
  });
});
