import { describe, expect, it } from "vitest";
import { getTableFilterProps } from "./helpers";

describe("table helpers", () => {
  describe("getTableFilterProps", () => {
    it.each([
      { color: "primary", isFilterActive: true },
      { color: undefined, isFilterActive: false },
    ])("highlights the filter only when active ($isFilterActive)", ({
      color,
      isFilterActive,
    }) => {
      const props = getTableFilterProps("Account", isFilterActive);

      expect(props).toHaveProperty("aria-label", "Account");
      expect(props).toMatchObject({
        color,
        placeholder: "Account",
        selectionMode: "multiple",
      });
    });
  });
});
