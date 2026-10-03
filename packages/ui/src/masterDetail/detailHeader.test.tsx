import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DetailEmptyState } from "./detailEmptyState";
import { DetailHeader } from "./detailHeader";

describe("DetailHeader", () => {
	it("renders the title and actions and goes back", () => {
		const onBack = vi.fn();

		render(
			<DetailHeader
				actions={<span>{"Actions"}</span>}
				masterTitle="Categories"
				onBack={onBack}
				title="Food"
			/>,
		);

		fireEvent.click(screen.getByLabelText("Categories"));

		expect(screen.getByText("Food")).toBeInTheDocument();
		expect(screen.getByText("Actions")).toBeInTheDocument();
		expect(onBack).toHaveBeenCalledOnce();
	});

	it("omits the title and actions when absent", () => {
		render(<DetailHeader masterTitle="Categories" onBack={vi.fn()} />);

		expect(screen.queryByRole("heading")).toBeNull();
	});
});

describe("DetailEmptyState", () => {
	it("prompts for a selection", () => {
		render(<DetailEmptyState />);

		expect(
			screen.getByText("Select an item to view its details."),
		).toBeInTheDocument();
	});
});
