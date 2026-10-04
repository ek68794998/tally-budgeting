import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BudgetMenuDropdown } from "./budgetMenuDropdown";

vi.mock("@heroui/react", async (importOriginal) => {
  const { withHeroUiStubs } = await import("../../testing/heroUi.js");
  return withHeroUiStubs(importOriginal);
});

describe("BudgetMenuDropdown", () => {
  it("links to the category editor", () => {
    render(<BudgetMenuDropdown />);

    expect(screen.getByTestId("dropdown-item")).toHaveAttribute(
      "data-href",
      "/budget/categories",
    );
    expect(screen.getByText("Categories")).toBeInTheDocument();
  });
});
