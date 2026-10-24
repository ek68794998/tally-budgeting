import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OneTimeExpensesSummary } from "./oneTimeExpensesSummary";

describe("OneTimeExpensesSummary", () => {
  it("renders the total in bold, without cents", () => {
    const { container } = render(
      <OneTimeExpensesSummary totalSpent={25000.75} />,
    );

    expect(container).toHaveTextContent("Plus $25,001 in one-time expenses");
    expect(screen.getByText("$25,001").tagName).toBe("B");
  });
});
