import { describe, expect, it } from "vitest";
import { type FormatCurrencyOptions, formatCurrency } from "./format";

describe("UI formatters", () => {
  describe("formatCurrency", () => {
    it.each<[number, FormatCurrencyOptions, string]>([
      [2.5, { showCents: true }, "$2.50"],
      [1000, { currencySymbol: "€", showCents: true }, "€1,000.00"],
      [1234.56, { currencySymbol: "¥", showCents: false }, "¥1,235"],
      [2.5, { showCentsIfLessThanDigits: 2 }, "$2.50"],
      [4.5, { showCentsIfLessThanDigits: 2 }, "$4.50"],
      [25.5, { showCentsIfLessThanDigits: 2 }, "$26"],
      [255.5, { showCentsIfLessThanDigits: 2 }, "$256"],
    ])("should format a number as currency", (value, options, expected) => {
      expect(formatCurrency(value, options)).toBe(expected);
    });
  });
});
