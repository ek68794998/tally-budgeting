import { describe, expect, it } from "vitest";
import { partitionByProviderVisibility } from "./partitionByProviderVisibility";

describe("partitionByProviderVisibility", () => {
  it.each([
    {
      expected: { hidden: [], visible: [null] },
      name: "no provider",
      provider: null,
    },
    {
      expected: { hidden: [], visible: ["fidelity"] },
      name: "a visible provider",
      provider: "fidelity" as const,
    },
    {
      expected: { hidden: ["chase"], visible: [] },
      name: "a hidden provider",
      provider: "chase" as const,
    },
  ])("puts an item with $name in the right group", ({ expected, provider }) => {
    const result = partitionByProviderVisibility([provider], (item) => item, [
      "chase",
    ]);

    expect(result).toEqual(expected);
  });

  it("preserves item order within each group", () => {
    const result = partitionByProviderVisibility(
      ["chase", "apple", "fidelity", "chase"] as const,
      (item) => item,
      ["chase"],
    );

    expect(result).toEqual({
      hidden: ["chase", "chase"],
      visible: ["apple", "fidelity"],
    });
  });
});
