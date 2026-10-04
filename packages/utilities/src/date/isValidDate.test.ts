import { describe, expect, it } from "vitest";
import { isValidDate } from "./isValidDate";

describe("isValidDate", () => {
  it.each([
    ["valid date string", "2024-01-15", true],
    ["valid date-time string", "2024-01-15T09:30:00.000Z", true],
    ["invalid string", "not-a-date", false],
    ["empty string", "", false],
    ["random text", "hello world", false],
  ])("%s", (_label, input, expected) => {
    expect(isValidDate(input)).toBe(expected);
  });

  it.each([
    ["valid Date object", new Date("2024-01-15"), true],
    ["Invalid Date object", new Date("not-a-date"), false],
  ])("%s", (_label, input, expected) => {
    expect(isValidDate(input)).toBe(expected);
  });
});
