import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageLayout } from "./pageLayout";
import { PageTitle } from "./pageTitle";

vi.mock("./pageTitle", () => ({
	PageTitle: vi.fn(() => <div data-testid="page-title" />),
}));

describe("PageLayout", () => {
	it("renders the title, actions, and content", () => {
		render(
			<PageLayout
				actions={<button type="button">{"Act"}</button>}
				title="Budget"
			>
				<p>{"Content"}</p>
			</PageLayout>,
		);

		expect(screen.getByTestId("page-title")).toBeInTheDocument();
		expect(vi.mocked(PageTitle).mock.lastCall?.[0]).toMatchObject({
			title: "Budget",
		});
		expect(screen.getByText("Act")).toBeInTheDocument();
		expect(screen.getByText("Content")).toBeInTheDocument();
	});

	it("omits the actions area when there are none", () => {
		const { container } = render(<PageLayout title="Budget" />);

		expect(container.querySelector(".gap-2")).toBeNull();
	});
});
