import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MasterList } from "./masterList";
import { MasterPanel } from "./masterPanel";

vi.mock("./masterList", () => ({
	MasterList: vi.fn(() => <div data-testid="master-list" />),
}));

describe("MasterPanel", () => {
	it.each([
		{ selectedKey: null },
		{ selectedKey: 1 },
	])("renders the title, actions, and list (selected: $selectedKey)", ({
		selectedKey,
	}) => {
		const onSelect = vi.fn();

		render(
			<MasterPanel
				actions={<button type="button">{"Add"}</button>}
				getItemKey={(item: number) => item}
				items={[1]}
				onSelect={onSelect}
				renderItem={() => null}
				selectedKey={selectedKey}
				title="Categories"
			/>,
		);

		expect(screen.getAllByText("Categories")).toHaveLength(2);
		expect(screen.getAllByText("Add")).toHaveLength(2);
		expect(screen.getAllByTestId("master-list")).toHaveLength(2);
		expect(vi.mocked(MasterList).mock.lastCall?.[0]).toMatchObject({
			items: [1],
			onSelect,
			selectedKey,
		});
	});
});
