import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpinnerPage } from "./spinnerPage";

describe("SpinnerPage", () => {
	it("renders a spinner", () => {
		const { container } = render(<SpinnerPage />);

		expect(
			container.querySelector("[aria-label='Loading']"),
		).toBeInTheDocument();
	});
});
