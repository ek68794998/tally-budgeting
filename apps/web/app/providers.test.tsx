import { dangerouslyCoerceType } from "@tally/testing/dangerouslyCoerceType";
import { AuthProvider } from "@tally/ui/auth/authContext";
import { useSetting } from "@tally/ui/hooks/useSetting";
import { useDatabaseStatusStore } from "@tally/utilities/state/databaseStatus";
import { render, screen } from "@testing-library/react";
import { useTheme } from "ahooks";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthConfig } from "./auth/config";
import { ClientProviders, shouldRetryQuery } from "./clientProviders";
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
vi.mock("@tally/ui/hooks/useSetting", () => ({ useSetting: vi.fn() }));
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

const mockThemeSetting = (value: "dark" | "light" | "system") =>
	vi
		.mocked(useSetting)
		.mockReturnValue([
			value,
			vi.fn(),
			{ isLoading: false, scope: "local" },
		]);

describe("providers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockTheme("light");
		mockThemeSetting("system");
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

	it.each([
		{ databaseUnavailable: false, expected: true, failureCount: 0 },
		{ databaseUnavailable: false, expected: true, failureCount: 2 },
		{ databaseUnavailable: false, expected: false, failureCount: 3 },
		{ databaseUnavailable: true, expected: false, failureCount: 0 },
	])("retries a query after $failureCount failures (database unavailable: $databaseUnavailable): $expected", ({
		databaseUnavailable,
		expected,
		failureCount,
	}) => {
		useDatabaseStatusStore.setState({ isUnavailable: databaseUnavailable });

		expect(shouldRetryQuery(failureCount)).toBe(expected);
	});

	it("applies the dark theme class to the body", () => {
		mockTheme("dark");
		const { rerender } = render(<ThemeProvider />);

		expect(document.body).toHaveClass("dark");

		mockTheme("light");
		rerender(<ThemeProvider />);

		expect(document.body).not.toHaveClass("dark");
	});

	it("resolves the theme setting through ahooks", () => {
		const setThemeMode = vi.fn();
		vi.mocked(useTheme).mockReturnValue({
			setThemeMode,
			theme: "light",
			themeMode: "light",
		});
		mockThemeSetting("dark");

		render(<ThemeProvider />);

		expect(setThemeMode).toHaveBeenCalledWith("dark");
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
