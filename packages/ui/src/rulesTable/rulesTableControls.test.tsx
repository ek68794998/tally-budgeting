import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RulesTableControls } from "./rulesTableControls";

vi.mock("@heroui/react", async (importOriginal) => {
	const { withHeroUiStubs } = await import("../testing/heroUi.js");
	return withHeroUiStubs(importOriginal);
});

const renderControls = (
	props: Partial<React.ComponentProps<typeof RulesTableControls>> = {},
) => {
	const handlers = {
		onDelete: vi.fn(),
		onFilterChange: vi.fn(),
		onNewRule: vi.fn(),
	};

	render(
		<RulesTableControls
			displayedCount={4}
			selectedRules={new Set()}
			{...handlers}
			{...props}
		/>,
	);

	return handlers;
};

describe("RulesTableControls", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("debounces filter changes and adds a rule", () => {
		const { onFilterChange, onNewRule } = renderControls();

		fireEvent.change(screen.getByPlaceholderText("Search…"), {
			target: { value: "coffee" },
		});
		act(() => {
			vi.advanceTimersByTime(500);
		});
		fireEvent.click(screen.getByText("New Rule"));

		expect(onFilterChange).toHaveBeenLastCalledWith("coffee");
		expect(onNewRule).toHaveBeenCalledOnce();
	});

	it.each([
		{ selectedRules: "all" as const, title: "Delete All ({count})" },
		{ selectedRules: new Set([1]), title: "Delete Selected ({count})" },
	])("offers '$title' for the selection", ({ selectedRules, title }) => {
		const { onDelete } = renderControls({ selectedRules });

		fireEvent.click(screen.getByText(title));

		expect(onDelete).toHaveBeenCalledWith(selectedRules);
	});

	it("hides the actions menu without a selection", () => {
		renderControls();

		expect(screen.queryByTestId("dropdown-item")).toBeNull();
	});
});
