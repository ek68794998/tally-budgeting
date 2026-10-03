import { buildCategory } from "@tally/data-models/testing/fixtures";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryListItem } from "./categoryListItem";

describe("CategoryListItem", () => {
	it.each([
		{ expectedClass: "font-semibold", isSelected: true },
		{ expectedClass: "", isSelected: false },
	])("renders the category (selected=$isSelected) and handles clicks", ({
		expectedClass,
		isSelected,
	}) => {
		const onClick = vi.fn();

		render(
			<CategoryListItem
				category={buildCategory({ label: "Food" })}
				isSelected={isSelected}
				onClick={onClick}
				subcategoryCount={2}
			/>,
		);

		expect(screen.getByText("Food")).toHaveProperty(
			"className",
			expectedClass,
		);
		expect(screen.getByText("{count} subcategories")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button"));

		expect(onClick).toHaveBeenCalledOnce();
	});
});
