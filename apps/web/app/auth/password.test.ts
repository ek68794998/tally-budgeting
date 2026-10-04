import { describe, expect, it } from "vitest";
import { isPasswordCorrect } from "./password";

describe("isPasswordCorrect", () => {
  it.each([
    ["hunter2", "hunter2", true],
    ["hunter2", "Hunter2", false],
    ["", "hunter2", false],
    ["hunter2 ", "hunter2", false],
    ["a much longer candidate than the password", "short", false],
  ])("compares %j against %j", (candidate, actual, expected) => {
    expect(isPasswordCorrect(candidate, actual)).toBe(expected);
  });
});
