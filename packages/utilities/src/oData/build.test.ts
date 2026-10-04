import { describe, expect, it } from "vitest";
import { buildODataLiteFilter } from "./build";
import {
  type ODataLiteFilterExpression,
  type ODataLiteFilterOperator,
} from "./types";

describe("OData builder", () => {
  describe("buildODataLiteFilter", () => {
    it("returns empty string for empty array", () => {
      expect(buildODataLiteFilter([])).toBe("");
    });

    it.each([
      [
        [{ field: "name", operator: "eq" as const, value: "John" }],
        "name eq 'John'",
      ],
      [[{ field: "age", operator: "gt" as const, value: 25 }], "age gt 25"],
      [
        [{ field: "active", operator: "eq" as const, value: true }],
        "active eq true",
      ],
      [
        [{ field: "deleted", operator: "eq" as const, value: null }],
        "deleted eq null",
      ],
    ])("builds single expression: %s", (expressions, expected) => {
      expect(buildODataLiteFilter(expressions)).toBe(expected);
    });

    it.each<
      [
        ODataLiteFilterOperator,
        string,
        ODataLiteFilterExpression["value"],
        string,
      ]
    >([
      ["eq", "name", "John", "name eq 'John'"],
      ["ne", "name", "John", "name ne 'John'"],
      ["lt", "age", 30, "age lt 30"],
      ["le", "age", 30, "age le 30"],
      ["gt", "age", 20, "age gt 20"],
      ["ge", "age", 20, "age ge 20"],
    ])("supports %s operator", (operator, field, value, expected) => {
      const expressions: ODataLiteFilterExpression[] = [
        { field, operator, value },
      ];
      expect(buildODataLiteFilter(expressions)).toBe(expected);
    });

    it("joins multiple expressions with and", () => {
      const expressions: ODataLiteFilterExpression[] = [
        { field: "name", operator: "eq", value: "John" },
        { field: "age", operator: "gt", value: 25 },
        { field: "active", operator: "eq", value: true },
      ];
      expect(buildODataLiteFilter(expressions)).toBe(
        "name eq 'John' and age gt 25 and active eq true",
      );
    });

    it("escapes single quotes in strings", () => {
      const expressions: ODataLiteFilterExpression[] = [
        { field: "name", operator: "eq", value: "O'Brien" },
      ];
      expect(buildODataLiteFilter(expressions)).toBe("name eq 'O''Brien'");
    });

    it("formats dates as ISO strings", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const expressions: ODataLiteFilterExpression[] = [
        { field: "createdAt", operator: "ge", value: date },
      ];
      expect(buildODataLiteFilter(expressions)).toBe(
        "createdAt ge 2024-01-15T10:30:00.000Z",
      );
    });

    it("throws error for unsupported value types", () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const invalidObject = { nested: "object" } as unknown as Date;

      const expressions: ODataLiteFilterExpression[] = [
        { field: "data", operator: "eq", value: invalidObject },
      ];
      expect(() => buildODataLiteFilter(expressions)).toThrow(
        "Unsupported value type",
      );
    });
  });
});
