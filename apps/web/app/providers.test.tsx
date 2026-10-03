import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { AuthProvider } from "@tally/ui/auth/authContext";
import { render, screen } from "@testing-library/react";
import { useTheme } from "ahooks";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthConfig } from "./auth/config";
import { ClientProviders } from "./clientProviders";
import { ServerProviders } from "./serverProviders";
import { StyleProvider } from "./styles/styleProvider";
import { ThemeProvider } from "./styles/themeProvider";

vi.mock("@tally/ui/auth/authContext", () => ({
	AuthProvider: vi.fn(({ children }: React.PropsWithChildren) => (
		<div data-testid="auth">{children}</div>
	)),
}));
vi.mock("@tally/ui/auth/sessionExpiredModal", () => ({
	SessionExpiredModal: vi.fn(() => <div data-testid="session-expired" />),
}));
vi.mock("ahooks", async (importOriginal) => ({
	...(await importOriginal<typeof import("ahooks")>()),
	useTheme: vi.fn(),
}));
vi.mock("next-intl", () => ({
	NextIntlClientProvider: vi.fn(({ children }: React.PropsWithChildren) => (
		<div data-testid="intl">{children}</div>
	)),
}));
vi.mock("next-intl/server", () => ({ getMessages: vi.fn() }));
vi.mock("./auth/config", () => ({ getAuthConfig: vi.fn() }));

const mockTheme = (theme: "dark" | "light") =>
	vi.mocked(useTheme).mockReturnValue({
		setThemeMode: vi.fn(),
		theme,
		themeMode: theme,
	});

describe("providers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockTheme("light");
	});

	it.each([
		{ isAuthEnabled: true, mode: "password" as const },
		{ isAuthEnabled: false, mode: "disabled" as const },
	])("provides messages and auth mode $mode on the server", async ({
		isAuthEnabled,
		mode,
	}) => {
		const messages = { hello: "Hello" };
		vi.mocked(getMessages).mockResolvedValue(
			dangerouslyCoerceType<Awaited<ReturnType<typeof getMessages>>>(
				messages,
			),
		);
		vi.mocked(getAuthConfig).mockReturnValue(
			mode === "password" ? { mode, password: "secret" } : { mode },
		);

		render(
			await ServerProviders({
				children: <div data-testid="child" />,
				locale: "en",
			}),
		);

		expect(screen.getByTestId("auth")).toContainElement(
			screen.getByTestId("child"),
		);
		expect(
			vi.mocked(NextIntlClientProvider).mock.lastCall?.[0],
		).toMatchObject({
			locale: "en",
			messages,
		});
		expect(vi.mocked(AuthProvider).mock.lastCall?.[0]).toMatchObject({
			isAuthEnabled,
		});
	});

	it("wraps the client app with styles, queries, and the session-expired modal", () => {
		render(
			<ClientProviders>
				<div data-testid="child" />
			</ClientProviders>,
		);

		expect(screen.getByTestId("child")).toBeInTheDocument();
		expect(screen.getByTestId("session-expired")).toBeInTheDocument();
	});

	it("applies the dark theme class to the body", () => {
		mockTheme("dark");
		const { rerender } = render(<ThemeProvider />);

		expect(document.body).toHaveClass("dark");

		mockTheme("light");
		rerender(<ThemeProvider />);

		expect(document.body).not.toHaveClass("dark");
	});

	it("applies a class name to the style provider", () => {
		const { container } = render(
			<StyleProvider className="subpixel-antialiased">
				<div data-testid="child" />
			</StyleProvider>,
		);

		expect(
			container.querySelector(".subpixel-antialiased"),
		).toContainElement(screen.getByTestId("child"));
	});
});
