import { type Asset } from "@tally/data-models/contracts/asset";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import { HappinessLevelDefault } from "@tally/data-models/contracts/happinessLevel";
import {
	DefaultSubcategoryId,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { transactionSchema } from "@tally/data-models/contracts/transaction";
import { beforeEach, describe, expect, it } from "vitest";
import { AppleDataProvider } from "./apple";
import { type TransactionCustomizations } from "./types";

describe("AppleDataProvider", () => {
	let provider: AppleDataProvider;
	let customizations: TransactionCustomizations;
	let testAccount: Asset;
	let testSubcategory: Subcategory;

	beforeEach(() => {
		provider = new AppleDataProvider();

		testSubcategory = {
			budget: {
				amountCents: 10000,
				frequency: 12,
				type: "expense",
			},
			categoryId: 5,
			description: "Coffee and cafes",
			id: 101,
			label: "Coffee",
			percentNeeds: 0,
			percentSavings: 0,
		};

		testAccount = {
			active: true,
			id: 1,
			name: "Apple Card",
			provider: "apple",
			type: "short_term_liability",
			valueCents: 0,
		};

		customizations = {
			accounts: [testAccount],
			merchants: [
				{
					categoryId: 101,
					friendlyName: "Starbucks",
					matcherRegex: /STARBUCKS/i,
				},
			],
			subcategories: [testSubcategory],
		};
	});

	describe("convertStatementRowToTransaction", () => {
		it("should convert a basic purchase transaction", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "5.50",
				Category: "Food & Drink",
				"Clearing Date": "01/15/2024",
				Description: "STARBUCKS COFFEE",
				Merchant: "Starbucks",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Apple Card",
				customizations,
			);

			expect(result).toEqual({
				accountId: 1,
				amountCents: 550,
				categoryId: 5,
				date: new Date("01/15/2024").toISOString(),
				id: -1,
				merchant: "Starbucks",
				subcategoryId: 101,
				type: "debit",
			});
		});

		it("should convert transaction types and amounts correctly", () => {
			const purchaseRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "5.50",
				Category: "Food & Drink",
				"Clearing Date": "01/15/2024",
				Description: "STARBUCKS COFFEE",
				Merchant: "Starbucks",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const refundRow = {
				...purchaseRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "25.00",
				Type: "Refund",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const adjustmentRow = {
				...purchaseRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "10.00",
				Type: "Adjustment",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const purchase = provider.convertStatementRowToTransaction(
				purchaseRow,
				"Apple Card",
				customizations,
			);
			const refund = provider.convertStatementRowToTransaction(
				refundRow,
				"Apple Card",
				customizations,
			);
			const adjustment = provider.convertStatementRowToTransaction(
				adjustmentRow,
				"Apple Card",
				customizations,
			);

			expect(purchase.type).toBe("debit");
			expect(purchase.amountCents).toBe(550);
			expect(refund.type).toBe("credit");
			expect(refund.amountCents).toBe(2500);
			expect(adjustment.type).toBe("credit");
			expect(adjustment.amountCents).toBe(1000);
		});

		it("should handle various amount formats correctly", () => {
			const negativeRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "-15.75",
				Category: "Food & Drink",
				"Clearing Date": "01/15/2024",
				Description: "STARBUCKS COFFEE",
				Merchant: "Starbucks",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const decimalRow = {
				...negativeRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "99.99",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const negative = provider.convertStatementRowToTransaction(
				negativeRow,
				"Apple Card",
				customizations,
			);
			const decimal = provider.convertStatementRowToTransaction(
				decimalRow,
				"Apple Card",
				customizations,
			);

			expect(negative.amountCents).toBe(1575);
			expect(decimal.amountCents).toBe(9999);
		});

		it("should use default subcategory when no matching merchant found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "10.00",
				Category: "Shopping",
				"Clearing Date": "01/15/2024",
				Description: "UNKNOWN MERCHANT",
				Merchant: "Unknown",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Apple Card",
				customizations,
			);

			expect(result.merchant).toBe("UNKNOWN MERCHANT");
			expect(result.subcategoryId).toBe(DefaultSubcategoryId);
			expect(result.categoryId).toBe(DefaultCategoryId);
		});

		it("should throw error when account not found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "10.00",
				Category: "Shopping",
				"Clearing Date": "01/15/2024",
				Description: "TEST",
				Merchant: "Test",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
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
				provider: "chase",
			};

			const customizationsWithWrongProvider = {
				...customizations,
				accounts: [wrongProviderAccount],
			};

			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "10.00",
				Category: "Shopping",
				"Clearing Date": "01/15/2024",
				Description: "TEST",
				Merchant: "Test",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(() =>
				provider.convertStatementRowToTransaction(
					row,
					"Apple Card",
					customizationsWithWrongProvider,
				),
			).toThrow("does not match provider");
		});

		it("should always set id to -1", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "5.00",
				Category: "Shopping",
				"Clearing Date": "01/15/2024",
				Description: "TEST",
				Merchant: "Test",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Apple Card",
				customizations,
			);

			const resultWithId = transactionSchema.parse({
				...result,
				happiness: HappinessLevelDefault,
				notes: "",
			});

			expect(resultWithId.id).toBe(-1);
		});
	});

	describe("isStatementRowIgnored", () => {
		it("should ignore Payment and Daily Cash Adjustment transactions", () => {
			const paymentRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "100.00",
				Category: "Payment",
				"Clearing Date": "01/15/2024",
				Description: "PAYMENT RECEIVED",
				Merchant: "",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Payment",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const dailyCashRow = {
				...paymentRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "1.50",
				Category: "Daily Cash",
				Description: "DAILY CASH ADJUSTMENT",
				Type: "Adjustment",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const dailyCashLowercaseRow = {
				...dailyCashRow,
				Description: "daily cash adjustment", // eslint-disable-line @typescript-eslint/naming-convention
			};

			expect(provider.isStatementRowIgnored(paymentRow)).toBe(true);
			expect(provider.isStatementRowIgnored(dailyCashRow)).toBe(true);
			expect(provider.isStatementRowIgnored(dailyCashLowercaseRow)).toBe(
				true,
			);
		});

		it("should not ignore regular transactions", () => {
			const purchaseRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "10.00",
				Category: "Shopping",
				"Clearing Date": "01/15/2024",
				Description: "REGULAR PURCHASE",
				Merchant: "Store",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const refundRow = {
				...purchaseRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Description: "REFUND FROM STORE",
				Type: "Refund",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(provider.isStatementRowIgnored(purchaseRow)).toBe(false);
			expect(provider.isStatementRowIgnored(refundRow)).toBe(false);
		});
	});

	describe("validateIsStatementRow", () => {
		it("should validate a correct statement row", () => {
			const validRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "10.00",
				Category: "Shopping",
				"Clearing Date": "01/15/2024",
				Description: "TEST MERCHANT",
				Merchant: "Test",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors: string[] = [];
			const result = provider.validateIsStatementRow(validRow, errors);

			expect(result).toBe(true);
			expect(errors).toHaveLength(0);
		});

		it("should reject invalid rows with appropriate errors", () => {
			const emptyDescriptionRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "10.00",
				Category: "Shopping",
				"Clearing Date": "01/15/2024",
				Description: "",
				Merchant: "Test",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const wrongShapeRow = {
				someField: "value",
			};

			const missingFieldsRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "10.00",
				Description: "TEST",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors1: string[] = [];
			expect(
				provider.validateIsStatementRow(emptyDescriptionRow, errors1),
			).toBe(false);
			expect(errors1).toEqual([
				"Description: Too small: expected string to have >=1 characters",
			]);

			const errors2: string[] = [];
			expect(
				provider.validateIsStatementRow(wrongShapeRow, errors2),
			).toBe(false);
			expect(errors2).toHaveLength(8);

			const errors3: string[] = [];
			expect(
				provider.validateIsStatementRow(missingFieldsRow, errors3),
			).toBe(false);
			expect(errors3).toHaveLength(6);

			const errors4: string[] = [];
			expect(provider.validateIsStatementRow(null, errors4)).toBe(false);
			expect(errors4).toHaveLength(1);

			const errors5: string[] = [];
			expect(provider.validateIsStatementRow(undefined, errors5)).toBe(
				false,
			);
			expect(errors5).toHaveLength(1);
		});

		it("should not clear validation errors array before validation", () => {
			const validRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount (USD)": "10.00",
				Category: "Shopping",
				"Clearing Date": "01/15/2024",
				Description: "TEST",
				Merchant: "Test",
				"Purchased By": "John Doe",
				"Transaction Date": "01/15/2024",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors = ["old error"];
			provider.validateIsStatementRow(validRow, errors);

			expect(errors).toHaveLength(1);
		});
	});
});
