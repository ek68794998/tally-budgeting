import { type Asset } from "@tally/data-models/contracts/asset";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import {
  DefaultSubcategoryId,
  type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { beforeEach, describe, expect, it } from "vitest";
import { type TransactionCustomizations } from "./types";
import { VestwellDataProvider } from "./vestwell";

describe("VestwellDataProvider", () => {
  let provider: VestwellDataProvider;
  let customizations: TransactionCustomizations;
  let testAccount: Asset;
  let testSubcategory: Subcategory;

  beforeEach(() => {
    provider = new VestwellDataProvider();

    testSubcategory = {
      budget: {
        amountCents: 10000,
        frequency: 12,
        type: "expense",
      },
      categoryId: 5,
      description: "Retirement contributions",
      id: 101,
      label: "401k",
      percentNeeds: 0,
      percentSavings: 0,
    };

    testAccount = {
      active: true,
      id: 1,
      name: "Vestwell 401k",
      provider: "vestwell",
      type: "fixed_asset",
      valueCents: 0,
    };

    customizations = {
      accounts: [testAccount],
      merchants: [
        {
          categoryId: 101,
          friendlyName: "Employer Match",
          matcherRegex: /EMPLOYER\s*MATCH/i,
        },
      ],
      subcategories: [testSubcategory],
    };
  });

  describe("convertStatementRowToTransaction", () => {
    it("should convert a basic employee contribution", () => {
      const row = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Employee Contribution",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const result = provider.convertStatementRowToTransaction(
        row,
        "Vestwell 401k",
        customizations,
      );

      expect(result).toEqual({
        accountId: 1,
        amountCents: 50000,
        categoryId: DefaultCategoryId,
        date: new Date("01/15/2024").toISOString(),
        merchant: "Employee Contribution",
        subcategoryId: DefaultSubcategoryId,
        type: "credit",
      });
    });

    it("should convert employer match contributions", () => {
      const row = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "250.00",
        "Funding Source": "Employer Match",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Employer Match",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const result = provider.convertStatementRowToTransaction(
        row,
        "Vestwell 401k",
        customizations,
      );

      expect(result.type).toBe("credit");
      expect(result.amountCents).toBe(25000);
      expect(result.merchant).toBe("Employer Match");
    });

    it("should convert fee transactions as debits", () => {
      const row = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "-5.00",
        "Funding Source": "Fee",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Management Fee",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const result = provider.convertStatementRowToTransaction(
        row,
        "Vestwell 401k",
        customizations,
      );

      expect(result.type).toBe("debit");
      expect(result.amountCents).toBe(500);
    });

    it("should handle various fee transaction types", () => {
      const baseFeeRow = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "-5.00",
        "Funding Source": "Fee",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Management Fee",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      for (const feeType of [
        "Management Fee",
        "Administrative Fee",
        "Service Fee",
      ]) {
        const result = provider.convertStatementRowToTransaction(
          /* eslint-disable-next-line @typescript-eslint/naming-convention */
          { ...baseFeeRow, "Transaction Type": feeType },
          "Vestwell 401k",
          customizations,
        );
        expect(result.type).toBe("debit");
      }
    });

    it("should handle various amount formats correctly", () => {
      const baseRow = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "1500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Employee Contribution",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const largeAmount = provider.convertStatementRowToTransaction(
        baseRow,
        "Vestwell 401k",
        customizations,
      );
      const smallAmount = provider.convertStatementRowToTransaction(
        {
          ...baseRow,
          Dollars: "0.50", // eslint-disable-line @typescript-eslint/naming-convention
        },
        "Vestwell 401k",
        customizations,
      );

      expect(largeAmount.amountCents).toBe(150000);
      expect(smallAmount.amountCents).toBe(50);
    });

    it("should trim whitespace from transaction type", () => {
      const row = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "  Employee Contribution  ",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const result = provider.convertStatementRowToTransaction(
        row,
        "Vestwell 401k",
        customizations,
      );

      expect(result.merchant).toBe("Employee Contribution");
    });

    it("should use default subcategory when no matching merchant found", () => {
      const row = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Unknown Transaction Type",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const result = provider.convertStatementRowToTransaction(
        row,
        "Vestwell 401k",
        customizations,
      );

      expect(result.merchant).toBe("Unknown Transaction Type");
      expect(result.subcategoryId).toBe(DefaultSubcategoryId);
      expect(result.categoryId).toBe(DefaultCategoryId);
    });

    it("should throw error when account not found", () => {
      const row = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Employee Contribution",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      expect(() =>
        provider.convertStatementRowToTransaction(
          row,
          "Nonexistent Account",
          customizations,
        ),
      ).toThrow("Account with name 'Nonexistent Account' not found");
    });

    it("should throw error when account exists but has wrong provider", () => {
      const wrongProviderAccount: Asset = {
        ...testAccount,
        provider: "fidelity",
      };

      const customizationsWithWrongProvider = {
        ...customizations,
        accounts: [wrongProviderAccount],
      };

      const row = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Employee Contribution",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      expect(() =>
        provider.convertStatementRowToTransaction(
          row,
          "Vestwell 401k",
          customizationsWithWrongProvider,
        ),
      ).toThrow("does not match provider");
    });
  });

  describe("isStatementRowIgnored", () => {
    it("should never ignore any statement rows", () => {
      const contributionRow = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Employee Contribution",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const feeRow = {
        ...contributionRow,
        /* eslint-disable @typescript-eslint/naming-convention */
        Dollars: "-5.00",
        "Transaction Type": "Management Fee",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const matchRow = {
        ...contributionRow,
        /* eslint-disable @typescript-eslint/naming-convention */
        Dollars: "250.00",
        "Transaction Type": "Employer Match",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      expect(provider.isStatementRowIgnored(contributionRow)).toBe(false);
      expect(provider.isStatementRowIgnored(feeRow)).toBe(false);
      expect(provider.isStatementRowIgnored(matchRow)).toBe(false);
    });
  });

  describe("validateIsStatementRow", () => {
    it("should validate a correct statement row", () => {
      const validRow = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Employee Contribution",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const errors: string[] = [];
      const result = provider.validateIsStatementRow(validRow, errors);

      expect(result).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it("should reject invalid rows with appropriate errors", () => {
      const emptyTransactionTypeRow = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const wrongShapeRow = {
        someField: "value",
      };

      const missingFieldsRow = {
        /* eslint-disable @typescript-eslint/naming-convention */
        Dollars: "500.00",
        "Transaction Type": "Employee Contribution",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const errors1: string[] = [];
      expect(
        provider.validateIsStatementRow(emptyTransactionTypeRow, errors1),
      ).toBe(false);
      expect(errors1).toEqual([
        "Transaction Type: Too small: expected string to have >=1 characters",
      ]);

      const errors2: string[] = [];
      expect(provider.validateIsStatementRow(wrongShapeRow, errors2)).toBe(
        false,
      );
      expect(errors2).toHaveLength(6);

      const errors3: string[] = [];
      expect(provider.validateIsStatementRow(missingFieldsRow, errors3)).toBe(
        false,
      );
      expect(errors3).toHaveLength(4);

      const errors4: string[] = [];
      expect(provider.validateIsStatementRow(null, errors4)).toBe(false);
      expect(errors4).toHaveLength(1);

      const errors5: string[] = [];
      expect(provider.validateIsStatementRow(undefined, errors5)).toBe(false);
      expect(errors5).toHaveLength(1);
    });

    it("should not clear validation errors array before validation", () => {
      const validRow = {
        /* eslint-disable @typescript-eslint/naming-convention */
        "Contribution Year": "2024",
        Dollars: "500.00",
        "Funding Source": "Employee Pre-tax",
        "Settlement Date": "01/15/2024",
        "Trade Date": "01/10/2024",
        "Transaction Type": "Employee Contribution",
        /* eslint-enable @typescript-eslint/naming-convention */
      };

      const errors = ["old error"];
      provider.validateIsStatementRow(validRow, errors);

      expect(errors).toHaveLength(1);
    });
  });
});
