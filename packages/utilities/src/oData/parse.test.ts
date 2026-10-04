import { invariant } from "@ekumlin/typescript-toolkit/values";
import { describe, expect, it } from "vitest";
import { parseODataLiteFilter } from "./parse";

describe("OData parser", () => {
  describe("parseODataLiteFilter", () => {
    it("returns empty array for empty string", () => {
      expect(parseODataLiteFilter("")).toEqual([]);
      expect(parseODataLiteFilter("   ")).toEqual([]);
    });

    it.each([
      ["name eq 'John'", { field: "name", operator: "eq", value: "John" }],
      ["age gt 25", { field: "age", operator: "gt", value: 25 }],
      ["active eq true", { field: "active", operator: "eq", value: true }],
      ["active eq false", { field: "active", operator: "eq", value: false }],
      ["deleted eq null", { field: "deleted", operator: "eq", value: null }],
      [
        "deleted eq NonStandardString",
        {
          field: "deleted",
          operator: "eq",
          value: "NonStandardString",
        },
      ],
    ])("parses single expression: %s", (filter, expected) => {
      expect(parseODataLiteFilter(filter)).toEqual([expected]);
    });

    it.each([
      ["eq", "name eq 'John'", "John"],
      ["ne", "name ne 'Jane'", "Jane"],
      ["lt", "age lt 30", 30],
      ["le", "age le 30", 30],
      ["gt", "age gt 20", 20],
      ["ge", "age ge 20", 20],
    ])("parses %s operator", (operator, filter, value) => {
      const result = parseODataLiteFilter(filter);
      expect(result[0]?.operator).toBe(operator);
      expect(result[0]?.value).toBe(value);
    });

    it("parses multiple expressions joined with and", () => {
      const filter = "name eq 'John' and age gt 25 and active eq true";
      expect(parseODataLiteFilter(filter)).toEqual([
        { field: "name", operator: "eq", value: "John" },
        { field: "age", operator: "gt", value: 25 },
        { field: "active", operator: "eq", value: true },
      ]);
    });

    it("unescapes single quotes in strings", () => {
      const filter = "name eq 'O''Brien'";
      expect(parseODataLiteFilter(filter)).toEqual([
        { field: "name", operator: "eq", value: "O'Brien" },
      ]);
    });

    it("handles operators inside quoted strings", () => {
      const filter = "description eq 'John eq Mary'";
      expect(parseODataLiteFilter(filter)).toEqual([
        { field: "description", operator: "eq", value: "John eq Mary" },
      ]);
    });

    it("handles multiple operators in quoted strings", () => {
      const filter = "text eq 'a ge b and c le d'";
      expect(parseODataLiteFilter(filter)).toEqual([
        { field: "text", operator: "eq", value: "a ge b and c le d" },
      ]);
    });

    it("parses ISO date strings as Date objects", () => {
      const filter = "createdAt ge 2024-01-15T10:30:00.000Z";
      const result = parseODataLiteFilter(filter);
      invariant(result[0]?.value instanceof Date, "Expected a Date object");
      expect(result[0].value.toISOString()).toBe("2024-01-15T10:30:00.000Z");
    });

    it("throws error for invalid expressions", () => {
      expect(() => parseODataLiteFilter("invalid")).toThrow(
        "Invalid filter expression",
      );
      expect(() => parseODataLiteFilter("name 'John'")).toThrow(
        "Invalid filter expression",
      );
    });

    it.each([
      ["name eq ''", { field: "name", operator: "eq", value: "" }],
      [
        "description eq '   '",
        { field: "description", operator: "eq", value: "   " },
      ],
    ])("handles empty and whitespace-only strings: %s", (filter, expected) => {
      expect(parseODataLiteFilter(filter)).toEqual([expected]);
    });

    it.each([
      ["age eq 0", 0],
      ["count eq -5", -5],
      ["price eq 3.14", 3.14],
      ["value eq -0.001", -0.001],
    ])("handles numeric edge cases: %s", (filter, expectedValue) => {
      const result = parseODataLiteFilter(filter);
      expect(result[0]?.value).toBe(expectedValue);
    });

    it("handles escaped quotes at start and end of string", () => {
      const filter = "name eq '''quoted'''";
      expect(parseODataLiteFilter(filter)).toEqual([
        { field: "name", operator: "eq", value: "'quoted'" },
      ]);
    });

    it("handles consecutive escaped quotes", () => {
      const filter = "name eq 'a''''b'";
      expect(parseODataLiteFilter(filter)).toEqual([
        { field: "name", operator: "eq", value: "a''b" },
      ]);
    });

    it("handles field names with underscores and numbers", () => {
      const filter = "field_name_123 eq 'value'";
      expect(parseODataLiteFilter(filter)).toEqual([
        { field: "field_name_123", operator: "eq", value: "value" },
      ]);
    });

    it("trims whitespace around expressions", () => {
      const filter = "  name eq 'John'  and  age gt 25  ";
      expect(parseODataLiteFilter(filter)).toEqual([
        { field: "name", operator: "eq", value: "John" },
        { field: "age", operator: "gt", value: 25 },
      ]);
    });
  });
});
