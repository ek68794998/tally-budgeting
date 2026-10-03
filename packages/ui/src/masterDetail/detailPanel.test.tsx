import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DetailHeader } from "./detailHeader";
import { DetailPanel } from "./detailPanel";

vi.mock("./detailEmptyState", () => ({
	DetailEmptyState: vi.fn(() => <div data-testid="detail-empty-state" />),
}));
vi.mock("./detailHeader", () => ({
	DetailHeader: vi.fn(() => <div data-testid="detail-header" />),
}));

const baseProps = {
	content: (item: string | null) => <p>{`Content ${item}`}</p>,
	masterTitle: "Items",
	onBack: vi.fn(),
};

describe("DetailPanel", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the header and content for the selected item", () => {
		render(
			<DetailPanel
				{...baseProps}
				actions={(item) => (
					<button type="button">{`Edit ${item}`}</button>
				)}
				selectedItem="one"
				selectedKey="one"
				title={(item) => `Title ${item}`}
			/>,
		);

		expect(screen.getByText("Content one")).toBeInTheDocument();
		expect(vi.mocked(DetailHeader).mock.lastCall?.[0]).toMatchObject({
			masterTitle: "Items",
			title: "Title one",
		});
	});

	it.each([
		{ emptyState: undefined, expectedTestId: "detail-empty-state" },
		{
			emptyState: <div data-testid="custom-empty" />,
			expectedTestId: "custom-empty",
		},
	])("shows an empty state without a selection", ({
		emptyState,
		expectedTestId,
	}) => {
		render(
			<DetailPanel
				{...baseProps}
				emptyState={emptyState}
				selectedItem={null}
				selectedKey={null}
			/>,
		);

		expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
		expect(DetailHeader).not.toHaveBeenCalled();
	});
});
