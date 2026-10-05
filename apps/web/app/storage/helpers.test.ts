import { describe, expect, it } from "vitest";
import { buildLikePattern, getOrderDirection, parseInValues } from "./helpers";

describe("storage.helpers", () => {
  describe("buildLikePattern", () => {
    it.each([
      ["coffee", "%coffee%"],
      ["", "%%"],
      [123, "%123%"],
      ["foo bar", "%foo bar%"],
    ])("wraps %o in % wildcards → %s", (input, expected) => {
      expect(buildLikePattern(input)).toBe(expected);
    });
  });

  describe("getOrderDirection", () => {
    it.each([
      ["ascending", "asc"],
      ["descending", "desc"],
    ] as const)("maps %s → %s", (input, expected) => {
      expect(getOrderDirection(input)).toBe(expected);
    });
  });

  describe("parseInValues", () => {
    it("splits a comma-separated string into an array", () => {
      expect(parseInValues("1,2,3")).toEqual(["1", "2", "3"]);
    });

    it("applies converter function to each value", () => {
      expect(parseInValues("1,2,3", Number)).toEqual([1, 2, 3]);
    });

    it("filters out null and undefined returned by converter", () => {
      const converter = (v: string) => (v === "skip" ? null : v);

      expect(parseInValues("a,skip,b", converter)).toEqual(["a", "b"]);
    });

    it("handles a single value", () => {
      expect(parseInValues("42")).toEqual(["42"]);
    });
  });
});
