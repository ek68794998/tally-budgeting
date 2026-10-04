import { describe, expect, it } from "vitest";
import { httpIncomingDataSchema, httpOutgoingDataSchema } from "./types";

describe("telemetry data schemas", () => {
  it.each([
    {
      data: { method: "GET", path: "/api", statusCode: 200 },
      schema: httpIncomingDataSchema,
    },
    {
      data: { method: "GET", url: "https://example.com" },
      schema: httpOutgoingDataSchema,
    },
  ])("accepts minimal valid data", ({ data, schema }) => {
    expect(schema.parse(data)).toEqual(data);
  });

  it.each([
    httpIncomingDataSchema,
    httpOutgoingDataSchema,
  ])("rejects data without a method", (schema) => {
    expect(schema.safeParse({}).success).toBe(false);
  });
});
