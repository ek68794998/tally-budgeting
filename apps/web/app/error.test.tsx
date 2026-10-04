import { useDatabaseStatusStore } from "@tally/utilities/state/databaseStatus";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";

const stubHealthResponse = (status: number, body: unknown = null) =>
	vi.stubGlobal(
		"fetch",
		vi.fn(() =>
			Promise.resolve(
				new Response(body === null ? null : JSON.stringify(body), {
					status,
				}),
			),
		),
	);

describe("ErrorPage", () => {
	beforeEach(() => {
		useDatabaseStatusStore.getState().clear();
		stubHealthResponse(204);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("shows the stack and offers to retry or reload", () => {
		const reload = vi.fn();
		const reset = vi.fn();
		vi.stubGlobal("location", { reload });
		const error = Object.assign(new Error("boom"), {
			stack: "Error: boom at x",
		});

		render(<ErrorPage error={error} reset={reset} />);

		expect(screen.getByText("Error: boom at x")).toBeInTheDocument();

		fireEvent.click(screen.getByText("Try Again"));
		fireEvent.click(screen.getByText("Reload Page"));

		expect(reset).toHaveBeenCalledOnce();
		expect(reload).toHaveBeenCalledOnce();
	});

	it.each([
		{
			body: { error: { code: "databaseUnavailable" }, success: false },
			expected: true,
			status: 503,
		},
		{ body: null, expected: false, status: 204 },
	])("marks the database unavailable when the health check returns $status: $expected", async ({
		body,
		expected,
		status,
	}) => {
		stubHealthResponse(status, body);

		render(<ErrorPage error={new Error("boom")} reset={vi.fn()} />);

		await waitFor(() =>
			expect(fetch).toHaveBeenCalledWith("/api/health", undefined),
		);
		await waitFor(() =>
			expect(useDatabaseStatusStore.getState().isUnavailable).toBe(
				expected,
			),
		);
	});
});
