import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MoreDropdown } from "../moreDropdown/moreDropdown";
import { RuleRowDropdown } from "./ruleRowDropdown";

vi.mock("../moreDropdown/moreDropdown", () => ({
  MoreDropdown: vi.fn(() => <div data-testid="more-dropdown" />),
}));

describe("RuleRowDropdown", () => {
  it("maps each entry to its action", () => {
    const handlers = {
      onDelete: vi.fn(),
      onEdit: vi.fn(),
      onReorder: vi.fn(),
    };

    render(<RuleRowDropdown {...handlers} />);

    const entries = vi.mocked(MoreDropdown).mock.lastCall?.[0].entries ?? [];

    for (const entry of entries) {
      if ("action" in entry) {
        entry.action();
      }
    }

    expect(entries.map(({ key }) => key)).toEqual([
      "edit",
      "moveUp",
      "moveDown",
      "moveTop",
      "moveBottom",
      "delete",
    ]);
    expect(handlers.onEdit).toHaveBeenCalledOnce();
    expect(handlers.onDelete).toHaveBeenCalledOnce();
    expect(handlers.onReorder.mock.calls).toEqual([
      ["up"],
      ["down"],
      ["top"],
      ["bottom"],
    ]);
  });
});
