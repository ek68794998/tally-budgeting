import { describe, expect, it } from "vitest";
import { isDatabaseUnavailableError } from "./databaseErrors";

const withCode = (code: string) => Object.assign(new Error("failed"), { code });

describe("isDatabaseUnavailableError", () => {
  it.each([
    [
      "a connection timeout",
      new Error("Connection terminated due to connection timeout"),
    ],
    ["a dropped connection", new Error("Connection terminated unexpectedly")],
    ["a query timeout", new Error("Query read timeout")],
    [
      "a pool checkout timeout",
      new Error("timeout exceeded when trying to connect"),
    ],
    ["a refused connection", withCode("ECONNREFUSED")],
    ["an unresolvable host", withCode("ENOTFOUND")],
    ["a server shutdown", withCode("57P01")],
    ["a server still starting", withCode("57P03")],
    ["a wrapped cause", new Error("outer", { cause: withCode("ECONNRESET") })],
  ])("is true for %s", (_, error) => {
    expect(isDatabaseUnavailableError(error)).toBe(true);
  });

  it.each([
    ["a constraint violation", withCode("23505")],
    ["a generic error", new Error("boom")],
    ["a non-error value", "Connection terminated"],
    ["undefined", undefined],
  ])("is false for %s", (_, error) => {
    expect(isDatabaseUnavailableError(error)).toBe(false);
  });
});
