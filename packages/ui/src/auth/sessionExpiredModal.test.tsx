import { useSessionStore } from "@tally/utilities/state/session";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionExpiredModal } from "./sessionExpiredModal";

vi.mock("./loginForm", () => ({
	LoginForm: vi.fn(({ onSuccess }: { onSuccess: () => void }) => (
		<button data-testid="login-form" onClick={onSuccess} type="button" />
	)),
}));

vi.mock("next-intl", () => ({
	useTranslations: () => {
		const translate = (key: string) =>
			key === "title" ? "Session Expired" : key;

		return Object.assign(translate, {
			rich: (
				_key: string,
				values: { link: (chunks: string) => React.ReactNode },
			) => <span>{values.link("continue")}</span>,
		});
	},
}));

describe("SessionExpiredModal", () => {
	beforeEach(() => {
		useSessionStore.getState().clear();
	});

	it("renders nothing while the session is valid", () => {
		render(<SessionExpiredModal />);

		expect(screen.queryByText("Session Expired")).toBeNull();
	});

	it("opens when the session expires, then shows the login form on request", () => {
		render(<SessionExpiredModal />);

		act(() => useSessionStore.getState().markExpired());

		expect(screen.getByText("Session Expired")).toBeTruthy();
		expect(screen.queryByTestId("login-form")).toBeNull();

		fireEvent.click(screen.getByRole("link", { name: "continue" }));

		expect(screen.getByTestId("login-form")).toBeTruthy();
	});

	it("clears the expired state after logging in", () => {
		render(<SessionExpiredModal />);
		act(() => useSessionStore.getState().markExpired());
		fireEvent.click(screen.getByRole("link", { name: "continue" }));

		fireEvent.click(screen.getByTestId("login-form"));

		expect(useSessionStore.getState().isExpired).toBe(false);
	});
});
