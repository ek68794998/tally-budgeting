import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionsMenuDropdown } from "./transactionsMenuDropdown";

vi.mock("@heroui/react", async (importOriginal) => {
	const { withHeroUiStubs } = await import("../testing/heroUi.js");
	return withHeroUiStubs(importOriginal);
});

describe("TransactionsMenuDropdown", () => {
	it("links to rules and categories", () => {
		render(<TransactionsMenuDropdown />);

		expect(
			screen.getByText("Known Merchants").closest("[data-href]"),
		).toHaveAttribute("data-href", "/transactions/rules");
		expect(
			screen.getByText("Categories").closest("[data-href]"),
		).toHaveAttribute("data-href", "/budget/categories");
	});
});
