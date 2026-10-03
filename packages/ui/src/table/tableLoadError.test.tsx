import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TableLoadError } from "./tableLoadError";

describe("TableLoadError", () => {
	it.each([
		{ error: new Error("Boom"), expected: "Boom" },
		{ error: "Text failure", expected: "Text failure" },
	])("shows the error message $expected", ({ error, expected }) => {
		render(<TableLoadError error={error} />);

		expect(
			screen.getByText("Unable to load table data."),
		).toBeInTheDocument();
		expect(screen.getByText(expected)).toBeInTheDocument();
	});

	it("omits the detail when there is no message", () => {
		const { container } = render(<TableLoadError error={null} />);

		expect(container.querySelector(".font-mono")).toBeNull();
	});
});
