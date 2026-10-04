import { describe, expect, it } from "vitest";
import { type TransactionCustomizations } from "../dataProviders/types";
import { parseDescription } from "./parseDescription";

describe("parseDescription", () => {
  const baseCustomizations: TransactionCustomizations = {
    accounts: [],
    merchants: [],
    subcategories: [],
  };

  describe("with no merchants configured", () => {
    it("should return description as merchant and undefined subcategoryId", () => {
      const result = parseDescription("STARBUCKS COFFEE", baseCustomizations);

      expect(result).toEqual({
        merchant: "STARBUCKS COFFEE",
        subcategoryId: undefined,
      });
    });

    it("should handle empty description", () => {
      const result = parseDescription("", baseCustomizations);

      expect(result).toEqual({
        merchant: "",
        subcategoryId: undefined,
      });
    });
  });

  describe("with merchant matchers", () => {
    it("should match merchant and return friendly name", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Starbucks",
            matcherRegex: /STARBUCKS/i,
          },
        ],
      };

      const result = parseDescription("STARBUCKS COFFEE #1234", customizations);

      expect(result).toEqual({
        merchant: "Starbucks",
        subcategoryId: 1,
      });
    });

    it("should use first matching merchant when multiple match", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Coffee Shop",
            matcherRegex: /COFFEE/i,
          },
          {
            categoryId: 2,
            friendlyName: "Starbucks",
            matcherRegex: /STARBUCKS/i,
          },
        ],
      };

      const result = parseDescription("STARBUCKS COFFEE", customizations);

      expect(result).toEqual({
        merchant: "Coffee Shop",
        subcategoryId: 1,
      });
    });

    it("should handle merchant with capture group", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Store #$1",
            matcherRegex: /STORE #(\d+)/i,
          },
        ],
      };

      const result = parseDescription("STORE #5678", customizations);

      expect(result).toEqual({
        merchant: "Store #5678",
        subcategoryId: 1,
      });
    });

    it("should handle merchant with $1 placeholder but no capture group", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Generic Store $1",
            matcherRegex: /GENERIC STORE/i,
          },
        ],
      };

      const result = parseDescription("GENERIC STORE", customizations);

      expect(result).toEqual({
        merchant: "Generic Store ",
        subcategoryId: 1,
      });
    });

    it("should handle case-insensitive matching", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Amazon",
            matcherRegex: /amazon/i,
          },
        ],
      };

      const result = parseDescription("AMAZON.COM", customizations);

      expect(result).toEqual({
        merchant: "Amazon",
        subcategoryId: 1,
      });
    });

    it("should return original description when no merchant matches", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Starbucks",
            matcherRegex: /STARBUCKS/i,
          },
        ],
      };

      const result = parseDescription("TARGET STORE", customizations);

      expect(result).toEqual({
        merchant: "TARGET STORE",
        subcategoryId: undefined,
      });
    });
  });

  describe("with multiple merchants", () => {
    const customizations: TransactionCustomizations = {
      ...baseCustomizations,
      merchants: [
        {
          categoryId: 1,
          friendlyName: "Starbucks",
          matcherRegex: /STARBUCKS/i,
        },
        {
          categoryId: 2,
          friendlyName: "Amazon",
          matcherRegex: /AMAZON/i,
        },
        {
          categoryId: 3,
          friendlyName: "Target",
          matcherRegex: /TARGET/i,
        },
      ],
    };

    it.each([
      ["STARBUCKS COFFEE", { merchant: "Starbucks", subcategoryId: 1 }],
      ["AMAZON.COM PURCHASE", { merchant: "Amazon", subcategoryId: 2 }],
      ["TARGET STORE #1234", { merchant: "Target", subcategoryId: 3 }],
      [
        "UNKNOWN MERCHANT",
        { merchant: "UNKNOWN MERCHANT", subcategoryId: undefined },
      ],
    ])('should parse "%s" correctly', (description, expected) => {
      expect(parseDescription(description, customizations)).toEqual(expected);
    });
  });

  describe("with complex regex patterns", () => {
    it("should handle regex with multiple capture groups (only first used)", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Restaurant - $1",
            matcherRegex: /(\w+)\s+RESTAURANT\s+#(\d+)/i,
          },
        ],
      };

      const result = parseDescription("JOES RESTAURANT #123", customizations);

      expect(result).toEqual({
        merchant: "Restaurant - JOES",
        subcategoryId: 1,
      });
    });

    it("should handle anchored regex patterns", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Direct Match",
            matcherRegex: /^EXACT MATCH$/i,
          },
        ],
      };

      expect(parseDescription("EXACT MATCH", customizations)).toEqual({
        merchant: "Direct Match",
        subcategoryId: 1,
      });

      expect(parseDescription("EXACT MATCH EXTRA", customizations)).toEqual({
        merchant: "EXACT MATCH EXTRA",
        subcategoryId: undefined,
      });
    });

    it("should handle partial matches", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Gas Station",
            matcherRegex: /SHELL/i,
          },
        ],
      };

      const result = parseDescription(
        "SHELL GAS STATION 12345",
        customizations,
      );

      expect(result).toEqual({
        merchant: "Gas Station",
        subcategoryId: 1,
      });
    });
  });

  describe("edge cases", () => {
    it("should handle special characters in description", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Special Store",
            matcherRegex: /STORE/i,
          },
        ],
      };

      const result = parseDescription("STORE & MORE! @#$", customizations);

      expect(result).toEqual({
        merchant: "Special Store",
        subcategoryId: 1,
      });
    });

    it("should handle very long descriptions", () => {
      const longDescription = "A".repeat(500);
      const result = parseDescription(longDescription, baseCustomizations);

      expect(result).toEqual({
        merchant: longDescription,
        subcategoryId: undefined,
      });
    });

    it("should handle unicode characters", () => {
      const customizations: TransactionCustomizations = {
        ...baseCustomizations,
        merchants: [
          {
            categoryId: 1,
            friendlyName: "Café",
            matcherRegex: /CAFÉ/i,
          },
        ],
      };

      const result = parseDescription("CAFÉ RESTAURANT", customizations);

      expect(result).toEqual({
        merchant: "Café",
        subcategoryId: 1,
      });
    });
  });
});
