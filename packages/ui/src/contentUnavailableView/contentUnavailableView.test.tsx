import { IconZoomQuestion } from "@tabler/icons-react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContentUnavailableView } from "./contentUnavailableView";

describe("ContentUnavailableView", () => {
	it("renders text and actions", () => {
		const onClick = vi.fn();

		render(
			<ContentUnavailableView
				actions={[{ label: "Retry", onClick }]}
				IconComponent={IconZoomQuestion}
				primaryText="Nothing here"
				secondaryText="Try again later"
			/>,
		);

		expect(screen.getByText("Nothing here")).toBeInTheDocument();
		expect(screen.getByText("Try again later")).toBeInTheDocument();

		fireEvent.click(screen.getByText("Retry"));

		expect(onClick).toHaveBeenCalledOnce();
	});

	it("renders only the primary text by default", () => {
		const { container } = render(
			<ContentUnavailableView primaryText="Empty" />,
		);

		expect(screen.getByText("Empty")).toBeInTheDocument();
		expect(container.querySelector("p")).toBeNull();
		expect(container.querySelector("button")).toBeNull();
	});
});
