import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";

describe("ErrorPage", () => {
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
});
