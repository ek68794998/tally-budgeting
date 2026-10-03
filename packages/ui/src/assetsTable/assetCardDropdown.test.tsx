import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoreDropdown } from "../moreDropdown/moreDropdown";
import { AssetCardDropdown } from "./assetCardDropdown";

vi.mock("../moreDropdown/moreDropdown", () => ({
	MoreDropdown: vi.fn(() => <div data-testid="more-dropdown" />),
}));

describe("AssetCardDropdown", () => {
	it.each([
		{ isActive: true, label: "Deactivate" },
		{ isActive: false, label: "Activate" },
	])("offers to '$label' and wires every action", ({ isActive, label }) => {
		const handlers = {
			onDelete: vi.fn(),
			onEdit: vi.fn(),
			onSetActive: vi.fn(),
		};

		render(<AssetCardDropdown isActive={isActive} {...handlers} />);

		const entries =
			vi.mocked(MoreDropdown).mock.lastCall?.[0].entries ?? [];

		for (const entry of entries) {
			if ("action" in entry) {
				entry.action();
			}
		}

		expect(entries[0]?.label).toBe(label);
		expect(handlers.onSetActive).toHaveBeenCalledWith(!isActive);
		expect(handlers.onEdit).toHaveBeenCalledOnce();
		expect(handlers.onDelete).toHaveBeenCalledOnce();
	});
});
