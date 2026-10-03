import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./loginForm";

const stubFetchStatus = (status: number) =>
	vi.stubGlobal(
		"fetch",
		vi.fn(() => Promise.resolve(new Response(null, { status }))),
	);

const submitPassword = (password: string) => {
	fireEvent.change(screen.getByLabelText("Password"), {
		target: { value: password },
	});
	fireEvent.click(screen.getByRole("button", { name: "Log In" }));
};

describe("LoginForm", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("posts the password and calls onSuccess on success", async () => {
		stubFetchStatus(204);
		const onSuccess = vi.fn();

		render(<LoginForm onSuccess={onSuccess} />);
		submitPassword("pw");

		await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
		expect(globalThis.fetch).toHaveBeenCalledWith(
			"/api/auth/login",
			expect.objectContaining({
				body: JSON.stringify({ password: "pw" }),
			}),
		);
	});

	it.each([
		[401, "Incorrect password."],
		[429, "Too many attempts. Please try again later."],
		[
			500,
			"The server couldn't process your login. Check the server logs for details.",
		],
		[404, "Something went wrong. Please try again."],
	])("shows an inline error for a %i response", async (status, message) => {
		stubFetchStatus(status);
		const onSuccess = vi.fn();

		render(<LoginForm onSuccess={onSuccess} />);
		submitPassword("pw");

		expect(await screen.findByText(message)).toBeTruthy();
		expect(onSuccess).not.toHaveBeenCalled();
	});

	it("disables submit until a password is entered", () => {
		render(<LoginForm onSuccess={vi.fn()} />);

		expect(
			screen
				.getByRole("button", { name: "Log In" })
				.hasAttribute("disabled"),
		).toBe(true);
	});
});
