import { type Asset } from "@tally/data-models/contracts/asset";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import {
	DefaultSubcategoryId,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { beforeEach, describe, expect, it } from "vitest";
import { ChaseDataProvider } from "./chase";
import { type TransactionCustomizations } from "./types";

describe("ChaseDataProvider", () => {
	let provider: ChaseDataProvider;
	let customizations: TransactionCustomizations;
	let testAccount: Asset;
	let testSubcategory: Subcategory;

	beforeEach(() => {
		provider = new ChaseDataProvider();

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
			name: "Chase Sapphire",
			provider: "chase",
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
		it("should convert a basic sale transaction", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-5.50",
				Category: "Food & Drink",
				Description: "STARBUCKS COFFEE",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Chase Sapphire",
				customizations,
			);

			expect(result).toEqual({
				accountId: 1,
				amountCents: 550,
				categoryId: 5,
				date: new Date("01/15/2024").toISOString(),
				merchant: "Starbucks",
				subcategoryId: 101,
				type: "debit",
			});
		});

		it("should convert transaction types correctly", () => {
			const saleRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-5.50",
				Category: "Food & Drink",
				Description: "STARBUCKS COFFEE",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const debitRow = {
				...saleRow,
				Type: "Debit", // eslint-disable-line @typescript-eslint/naming-convention
			};

			const returnRow = {
				...saleRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "25.00",
				Type: "Return",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const paymentRow = {
				...saleRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "100.00",
				Type: "Payment",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const sale = provider.convertStatementRowToTransaction(
				saleRow,
				"Chase Sapphire",
				customizations,
			);
			const debit = provider.convertStatementRowToTransaction(
				debitRow,
				"Chase Sapphire",
				customizations,
			);
			const returnTx = provider.convertStatementRowToTransaction(
				returnRow,
				"Chase Sapphire",
				customizations,
			);
			const payment = provider.convertStatementRowToTransaction(
				paymentRow,
				"Chase Sapphire",
				customizations,
			);

			expect(sale.type).toBe("debit");
			expect(sale.amountCents).toBe(550);
			expect(debit.type).toBe("debit");
			expect(debit.amountCents).toBe(550);
			expect(returnTx.type).toBe("credit");
			expect(returnTx.amountCents).toBe(2500);
			expect(payment.type).toBe("credit");
			expect(payment.amountCents).toBe(10000);
		});

		it("should handle case-insensitive transaction types", () => {
			const uppercaseRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Category: "Shopping",
				Description: "TEST MERCHANT",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "SALE",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const lowercaseRow = {
				...uppercaseRow,
				Type: "sale", // eslint-disable-line @typescript-eslint/naming-convention
			};

			const mixedCaseRow = {
				...uppercaseRow,
				Type: "SaLe", // eslint-disable-line @typescript-eslint/naming-convention
			};

			const uppercase = provider.convertStatementRowToTransaction(
				uppercaseRow,
				"Chase Sapphire",
				customizations,
			);
			const lowercase = provider.convertStatementRowToTransaction(
				lowercaseRow,
				"Chase Sapphire",
				customizations,
			);
			const mixedCase = provider.convertStatementRowToTransaction(
				mixedCaseRow,
				"Chase Sapphire",
				customizations,
			);

			expect(uppercase.type).toBe("debit");
			expect(lowercase.type).toBe("debit");
			expect(mixedCase.type).toBe("debit");
		});

		it("should handle various amount formats correctly", () => {
			const negativeRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-15.75",
				Category: "Food & Drink",
				Description: "STARBUCKS COFFEE",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const positiveRow = {
				...negativeRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "99.99",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const negative = provider.convertStatementRowToTransaction(
				negativeRow,
				"Chase Sapphire",
				customizations,
			);
			const positive = provider.convertStatementRowToTransaction(
				positiveRow,
				"Chase Sapphire",
				customizations,
			);

			expect(negative.amountCents).toBe(1575);
			expect(positive.amountCents).toBe(9999);
		});

		it("should use default subcategory when no matching merchant found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Category: "Shopping",
				Description: "UNKNOWN MERCHANT",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Chase Sapphire",
				customizations,
			);

			expect(result.merchant).toBe("UNKNOWN MERCHANT");
			expect(result.subcategoryId).toBe(DefaultSubcategoryId);
			expect(result.categoryId).toBe(DefaultCategoryId);
		});

		it("should throw error when account not found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Category: "Shopping",
				Description: "TEST",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
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
				provider: "apple",
			};

			const customizationsWithWrongProvider = {
				...customizations,
				accounts: [wrongProviderAccount],
			};

			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Category: "Shopping",
				Description: "TEST",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(() =>
				provider.convertStatementRowToTransaction(
					row,
					"Chase Sapphire",
					customizationsWithWrongProvider,
				),
			).toThrow("does not match provider");
		});

		it("should trim whitespace from description", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Category: "Shopping",
				Description: "  STARBUCKS COFFEE  ",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Chase Sapphire",
				customizations,
			);

			expect(result.merchant).toBe("Starbucks");
		});
	});

	describe("isStatementRowIgnored", () => {
		it("should ignore automatic payment transactions", () => {
			const automaticPaymentRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "100.00",
				Category: "Payment",
				Description: "AUTOMATIC PAYMENT - THANK YOU",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Payment",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const automaticPaymentNoSpaceRow = {
				...automaticPaymentRow,
				Description: "AUTOMATICPAYMENT", // eslint-disable-line @typescript-eslint/naming-convention
			};

			const automaticPaymentExtraSpacesRow = {
				...automaticPaymentRow,
				Description: "AUTOMATIC     PAYMENT", // eslint-disable-line @typescript-eslint/naming-convention
			};

			expect(provider.isStatementRowIgnored(automaticPaymentRow)).toBe(
				true,
			);
			expect(
				provider.isStatementRowIgnored(automaticPaymentNoSpaceRow),
			).toBe(true);
			expect(
				provider.isStatementRowIgnored(automaticPaymentExtraSpacesRow),
			).toBe(true);
		});

		it("should not ignore regular transactions", () => {
			const saleRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Category: "Shopping",
				Description: "REGULAR PURCHASE",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const returnRow = {
				...saleRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Description: "REFUND FROM STORE",
				Type: "Return",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const manualPaymentRow = {
				...saleRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "100.00",
				Description: "PAYMENT RECEIVED",
				Type: "Payment",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(provider.isStatementRowIgnored(saleRow)).toBe(false);
			expect(provider.isStatementRowIgnored(returnRow)).toBe(false);
			expect(provider.isStatementRowIgnored(manualPaymentRow)).toBe(
				false,
			);
		});
	});

	describe("validateIsStatementRow", () => {
		it("should validate a correct statement row", () => {
			const validRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Category: "Shopping",
				Description: "TEST MERCHANT",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
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
				Amount: "-10.00",
				Category: "Shopping",
				Description: "",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const wrongShapeRow = {
				someField: "value",
			};

			const missingFieldsRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
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
			expect(errors2).toHaveLength(7);

			const errors3: string[] = [];
			expect(
				provider.validateIsStatementRow(missingFieldsRow, errors3),
			).toBe(false);
			expect(errors3).toHaveLength(5);

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
				Amount: "-10.00",
				Category: "Shopping",
				Description: "TEST",
				Memo: "",
				"Post Date": "01/15/2024",
				"Transaction Date": "01/15/2024",
				Type: "Sale",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors = ["old error"];
			provider.validateIsStatementRow(validRow, errors);

			expect(errors).toHaveLength(1);
		});
	});
});
