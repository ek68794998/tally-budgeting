import { type Asset } from "@tally/data-models/contracts/asset";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import {
	DefaultSubcategoryId,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { beforeEach, describe, expect, it } from "vitest";
import { FirstTechFederalDataProvider } from "./ftfcu";
import { type TransactionCustomizations } from "./types";

describe("FirstTechFederalDataProvider", () => {
	let provider: FirstTechFederalDataProvider;
	let customizations: TransactionCustomizations;
	let testAccount: Asset;
	let testSubcategory: Subcategory;

	beforeEach(() => {
		provider = new FirstTechFederalDataProvider();

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
			name: "First Tech Checking",
			provider: "firstTechFederal",
			type: "liquid_asset",
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
		it("should convert a basic debit transaction", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-5.50",
				Balance: "1000.00",
				"Check Number": "",
				Description: "POS Transaction STARBUCKS COFFEE",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"First Tech Checking",
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

		it("should convert a basic credit transaction", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "1500.00",
				Balance: "2500.00",
				"Check Number": "",
				Description: "DIRECT DEPOSIT PAYROLL",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "credit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"First Tech Checking",
				customizations,
			);

			expect(result.type).toBe("credit");
			expect(result.amountCents).toBe(150000);
		});

		it("should convert check transactions to debit type", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-100.00",
				Balance: "900.00",
				"Check Number": "1234",
				Description: "Check #1234",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "check",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"First Tech Checking",
				customizations,
			);

			expect(result.type).toBe("debit");
			expect(result.amountCents).toBe(10000);
		});

		it("should handle case-insensitive transaction types", () => {
			const uppercaseRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Balance: "990.00",
				"Check Number": "",
				Description: "TEST MERCHANT",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "DEBIT",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const mixedCaseRow = {
				...uppercaseRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Transaction Type": "DeBiT",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const uppercase = provider.convertStatementRowToTransaction(
				uppercaseRow,
				"First Tech Checking",
				customizations,
			);
			const mixedCase = provider.convertStatementRowToTransaction(
				mixedCaseRow,
				"First Tech Checking",
				customizations,
			);

			expect(uppercase.type).toBe("debit");
			expect(mixedCase.type).toBe("debit");
		});

		it("should trim boilerplate from description", () => {
			const posRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Balance: "990.00",
				"Check Number": "",
				Description: "POS Transaction STARBUCKS COFFEE",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const achRow = {
				...posRow,
				Description: "ACH Debit ELECTRIC COMPANY", // eslint-disable-line @typescript-eslint/naming-convention
			};

			const posResult = provider.convertStatementRowToTransaction(
				posRow,
				"First Tech Checking",
				customizations,
			);
			const achResult = provider.convertStatementRowToTransaction(
				achRow,
				"First Tech Checking",
				customizations,
			);

			expect(posResult.merchant).toBe("Starbucks");
			expect(achResult.merchant).toBe("ELECTRIC COMPANY");
		});

		it("should handle various amount formats correctly", () => {
			const negativeRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-15.75",
				Balance: "984.25",
				"Check Number": "",
				Description: "POS Transaction TEST",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const positiveRow = {
				...negativeRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "99.99",
				Balance: "1099.99",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const negative = provider.convertStatementRowToTransaction(
				negativeRow,
				"First Tech Checking",
				customizations,
			);
			const positive = provider.convertStatementRowToTransaction(
				positiveRow,
				"First Tech Checking",
				customizations,
			);

			expect(negative.amountCents).toBe(1575);
			expect(positive.amountCents).toBe(9999);
		});

		it("should use default subcategory when no matching merchant found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Balance: "990.00",
				"Check Number": "",
				Description: "UNKNOWN MERCHANT",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"First Tech Checking",
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
				Balance: "990.00",
				"Check Number": "",
				Description: "TEST",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
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
				Amount: "-10.00",
				Balance: "990.00",
				"Check Number": "",
				Description: "TEST",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(() =>
				provider.convertStatementRowToTransaction(
					row,
					"First Tech Checking",
					customizationsWithWrongProvider,
				),
			).toThrow("does not match provider");
		});
	});

	describe("isStatementRowIgnored", () => {
		it("should ignore autopay transactions", () => {
			const autopayRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-100.00",
				Balance: "900.00",
				"Check Number": "",
				Description: "CREDIT CARD - AUTOPAY",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const autopayNoSpaceRow = {
				...autopayRow,
				Description: "CREDIT CARD-AUTOPAY", // eslint-disable-line @typescript-eslint/naming-convention
			};

			const autopayExtraSpacesRow = {
				...autopayRow,
				Description: "CREDIT CARD -    AUTOPAY", // eslint-disable-line @typescript-eslint/naming-convention
			};

			expect(provider.isStatementRowIgnored(autopayRow)).toBe(true);
			expect(provider.isStatementRowIgnored(autopayNoSpaceRow)).toBe(
				true,
			);
			expect(provider.isStatementRowIgnored(autopayExtraSpacesRow)).toBe(
				true,
			);
		});

		it("should ignore payment transactions", () => {
			const paymentRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-50.00",
				Balance: "950.00",
				"Check Number": "",
				Description: "LOAN - PAYMENT",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const paymentNoSpaceRow = {
				...paymentRow,
				Description: "LOAN-PAYMENT", // eslint-disable-line @typescript-eslint/naming-convention
			};

			expect(provider.isStatementRowIgnored(paymentRow)).toBe(true);
			expect(provider.isStatementRowIgnored(paymentNoSpaceRow)).toBe(
				true,
			);
		});

		it("should ignore internal transfer transactions", () => {
			const withdrawalTransferRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-100.00",
				Balance: "900.00",
				"Check Number": "",
				Description: "Withdrawal Transfer to Savings *1234",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const depositTransferRow = {
				...withdrawalTransferRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "100.00",
				Description: "Deposit Transfer from Checking *5678",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(provider.isStatementRowIgnored(withdrawalTransferRow)).toBe(
				true,
			);
			expect(provider.isStatementRowIgnored(depositTransferRow)).toBe(
				true,
			);
		});

		it("should not ignore regular transactions", () => {
			const debitRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Balance: "990.00",
				"Check Number": "",
				Description: "POS Transaction STORE",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const creditRow = {
				...debitRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "50.00",
				Description: "REFUND FROM STORE",
				"Transaction Type": "credit",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const checkRow = {
				...debitRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Description: "Check #1234",
				"Transaction Type": "check",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(provider.isStatementRowIgnored(debitRow)).toBe(false);
			expect(provider.isStatementRowIgnored(creditRow)).toBe(false);
			expect(provider.isStatementRowIgnored(checkRow)).toBe(false);
		});

		it("should not ignore transfers without asterisk", () => {
			const transferRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-100.00",
				Balance: "900.00",
				"Check Number": "",
				Description: "Withdrawal Transfer to External Account",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(provider.isStatementRowIgnored(transferRow)).toBe(false);
		});
	});

	describe("validateIsStatementRow", () => {
		it("should validate a correct statement row", () => {
			const validRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Balance: "990.00",
				"Check Number": "",
				Description: "TEST MERCHANT",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors: string[] = [];
			const result = provider.validateIsStatementRow(validRow, errors);

			expect(result).toBe(true);
			expect(errors).toEqual([]);
		});

		it("should reject invalid rows with appropriate errors", () => {
			const emptyDescriptionRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Balance: "990.00",
				"Check Number": "",
				Description: "",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
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
			expect(errors1).toEqual(["No description found."]);

			const errors2: string[] = [];
			expect(
				provider.validateIsStatementRow(wrongShapeRow, errors2),
			).toBe(false);
			expect(errors2).toEqual([
				"Data shape does not match expected type.",
			]);

			const errors3: string[] = [];
			expect(
				provider.validateIsStatementRow(missingFieldsRow, errors3),
			).toBe(false);
			expect(errors3).toEqual([
				"Data shape does not match expected type.",
			]);

			const errors4: string[] = [];
			expect(provider.validateIsStatementRow(null, errors4)).toBe(false);
			expect(errors4).toEqual([
				"Data shape does not match expected type.",
			]);

			const errors5: string[] = [];
			expect(provider.validateIsStatementRow(undefined, errors5)).toBe(
				false,
			);
			expect(errors5).toEqual([
				"Data shape does not match expected type.",
			]);
		});

		it("should clear validation errors array before validation", () => {
			const validRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "-10.00",
				Balance: "990.00",
				"Check Number": "",
				Description: "TEST",
				"Effective Date": "01/15/2024",
				"Extended Description": "",
				Memo: "",
				"Posting Date": "01/15/2024",
				"Reference Number": "123456",
				"Transaction Category": "",
				"Transaction ID": "789",
				"Transaction Type": "debit",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors = ["old error"];
			provider.validateIsStatementRow(validRow, errors);

			expect(errors).toEqual([]);
		});
	});
});
