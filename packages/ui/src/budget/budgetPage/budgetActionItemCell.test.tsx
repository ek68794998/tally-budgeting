import {
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BudgetActionItemCell } from "./budgetActionItemCell";

describe("BudgetActionItemCell", () => {
	it.each([
		{ expectedCount: 1, subcontent: "Details" },
		{ expectedCount: 0, subcontent: undefined },
	])("renders the subcategory and content with subcontent=$subcontent", ({
		expectedCount,
		subcontent,
	}) => {
		render(
			<BudgetActionItemCell
				category={buildCategory()}
				content={"Spent a lot"}
				subcategory={buildSubcategory({ label: "Gifts" })}
				subcontent={subcontent}
			/>,
		);

		expect(screen.getByText("Gifts")).toBeInTheDocument();
		expect(screen.getByText("Spent a lot")).toBeInTheDocument();
		expect(screen.queryAllByText("Details")).toHaveLength(expectedCount);
	});
});
