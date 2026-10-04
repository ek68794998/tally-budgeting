import { describe, expect, it } from "vitest";
import { withoutId } from "./withoutId";

describe("withoutId", () => {
  it.each([
    {
      expected: { name: "test", value: 100 },
      item: { id: 42, name: "test", value: 100 },
    },
    { expected: {}, item: { id: 1 } },
  ])("removes the id from $item", ({ expected, item }) => {
    expect(withoutId(item)).toEqual(expected);
  });
});
