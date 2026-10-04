import { describe, expect, it } from "vitest";
import {
  getAutoRegexStringFromMerchantName,
  getRegexFlags,
  getRegexSafe,
} from "./helpers";

describe("rules table helpers", () => {
  it.each([
    ["Coffee Shop", "Coffee\\s*Shop"],
    ["A.B (C)", "A\\.B\\s*\\(C\\)"],
    ["7-Eleven  #12", "7-Eleven\\s*#12"],
  ])("builds a regex string for %s", (merchantName, expected) => {
    const regexString = getAutoRegexStringFromMerchantName(merchantName);

    expect(regexString).toBe(expected);
    expect(new RegExp(regexString).test(merchantName)).toBe(true);
  });

  it.each([
    [{ ignoreCase: true }, "i"],
    [{ ignoreCase: false }, ""],
    [{}, ""],
  ])("builds flags from %o", (options, expected) => {
    expect(getRegexFlags(options)).toBe(expected);
  });

  it.each([
    ["^coffee$", "i", /^coffee$/i],
    ["(unclosed", "", null],
    ["ok", "zz", null],
  ])("safely compiles /%s/%s", (pattern, flags, expected) => {
    expect(getRegexSafe(pattern, flags)).toEqual(expected);
  });
});
