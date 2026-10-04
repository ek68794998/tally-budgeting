import { describe, expect, it } from "vitest";
import { buildODataLiteFilter } from "./build";
import { parseODataLiteFilter } from "./parse";
import { type ODataLiteFilterExpression } from "./types";

describe("OData filtering E2E tests", () => {
  it.each<[ODataLiteFilterExpression]>([
    [{ field: "name", operator: "eq", value: "John" }],
    [{ field: "age", operator: "gt", value: 25 }],
    [{ field: "active", operator: "eq", value: true }],
    [{ field: "deleted", operator: "eq", value: null }],
    [{ field: "name", operator: "eq", value: "O'Brien" }],
  ])("roundtrips single expression: %j", (expression) => {
    const built = buildODataLiteFilter([expression]);
    const parsed = parseODataLiteFilter(built);
    expect(parsed).toEqual([expression]);
  });

  it("roundtrips multiple expressions", () => {
    const expressions: ODataLiteFilterExpression[] = [
      { field: "name", operator: "eq", value: "John" },
      { field: "age", operator: "gt", value: 25 },
      { field: "active", operator: "ne", value: false },
    ];
    const built = buildODataLiteFilter(expressions);
    const parsed = parseODataLiteFilter(built);
    expect(parsed).toEqual(expressions);
  });
});
