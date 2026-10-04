import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsSectionListItem } from "./settingsSectionListItem";
import { settingsSections } from "./settingsSections";

describe("SettingsSectionListItem", () => {
	it.each([
		{ expectedClass: "font-semibold", isSelected: true },
		{ expectedClass: "", isSelected: false },
	])("renders the section label (selected=$isSelected) and handles clicks", ({
		expectedClass,
		isSelected,
	}) => {
		const onClick = vi.fn();
		const [section] = settingsSections;

		if (!section) {
			throw new Error("Expected at least one section");
		}

		render(
			<SettingsSectionListItem
				isSelected={isSelected}
				onClick={onClick}
				section={section}
			/>,
		);

		expect(screen.getByText("General")).toHaveProperty(
			"className",
			expectedClass,
		);

		fireEvent.click(screen.getByRole("button"));

		expect(onClick).toHaveBeenCalledOnce();
	});
});
