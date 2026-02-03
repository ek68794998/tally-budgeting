import { type Asset } from "@tally/data-models/contracts/asset";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import {
	DefaultSubcategoryId,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { beforeEach, describe, expect, it } from "vitest";
import { GuidelineDataProvider } from "./guideline";
import { type TransactionCustomizations } from "./types";

describe("GuidelineDataProvider", () => {
	let provider: GuidelineDataProvider;
	let customizations: TransactionCustomizations;
	let testAccount: Asset;
	let testSubcategory: Subcategory;

	beforeEach(() => {
		provider = new GuidelineDataProvider();

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
			name: "Guideline 401k",
			provider: "guideline",
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
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "Employee Contribution",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Guideline 401k",
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
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "250.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "250.00",
				"Transaction Id": "123456",
				"Transaction type": "Employer Match",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Guideline 401k",
				customizations,
			);

			expect(result.type).toBe("credit");
			expect(result.amountCents).toBe(25000);
			expect(result.merchant).toBe("Employer Match");
		});

		it("should convert fee transactions as debits", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "0.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "5.00",
				"Transaction Id": "123456",
				"Transaction type": "Management Fee",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Guideline 401k",
				customizations,
			);

			expect(result.type).toBe("debit");
			expect(result.amountCents).toBe(500);
		});

		it("should handle various fee transaction types", () => {
			const managementFeeRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "0.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "5.00",
				"Transaction Id": "123456",
				"Transaction type": "Management Fee",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const adminFeeRow = {
				...managementFeeRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Transaction type": "Administrative Fee",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const serviceFeeRow = {
				...managementFeeRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Transaction type": "Service Fee",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const managementFee = provider.convertStatementRowToTransaction(
				managementFeeRow,
				"Guideline 401k",
				customizations,
			);
			const adminFee = provider.convertStatementRowToTransaction(
				adminFeeRow,
				"Guideline 401k",
				customizations,
			);
			const serviceFee = provider.convertStatementRowToTransaction(
				serviceFeeRow,
				"Guideline 401k",
				customizations,
			);

			expect(managementFee.type).toBe("debit");
			expect(adminFee.type).toBe("debit");
			expect(serviceFee.type).toBe("debit");
		});

		it("should handle Roth contributions", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "0.00",
				"Requested date": "01/10/2024",
				Roth: "300.00",
				Total: "300.00",
				"Transaction Id": "123456",
				"Transaction type": "Roth Contribution",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Guideline 401k",
				customizations,
			);

			expect(result.type).toBe("credit");
			expect(result.amountCents).toBe(30000);
		});

		it("should handle mixed pre-tax and Roth contributions", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "300.00",
				"Requested date": "01/10/2024",
				Roth: "200.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "Employee Contribution",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Guideline 401k",
				customizations,
			);

			expect(result.amountCents).toBe(50000);
		});

		it("should handle various amount formats correctly", () => {
			const largeAmountRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "1500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "1500.00",
				"Transaction Id": "123456",
				"Transaction type": "Employee Contribution",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const smallAmountRow = {
				...largeAmountRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Pre-tax": "0.50",
				Total: "0.50",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const largeAmount = provider.convertStatementRowToTransaction(
				largeAmountRow,
				"Guideline 401k",
				customizations,
			);
			const smallAmount = provider.convertStatementRowToTransaction(
				smallAmountRow,
				"Guideline 401k",
				customizations,
			);

			expect(largeAmount.amountCents).toBe(150000);
			expect(smallAmount.amountCents).toBe(50);
		});

		it("should trim whitespace from transaction type", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "  Employee Contribution  ",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Guideline 401k",
				customizations,
			);

			expect(result.merchant).toBe("Employee Contribution");
		});

		it("should use default subcategory when no matching merchant found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "Unknown Transaction Type",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Guideline 401k",
				customizations,
			);

			expect(result.merchant).toBe("Unknown Transaction Type");
			expect(result.subcategoryId).toBe(DefaultSubcategoryId);
			expect(result.categoryId).toBe(DefaultCategoryId);
		});

		it("should throw error when account not found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "Employee Contribution",
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
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "Employee Contribution",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(() =>
				provider.convertStatementRowToTransaction(
					row,
					"Guideline 401k",
					customizationsWithWrongProvider,
				),
			).toThrow("does not match provider");
		});
	});

	describe("isStatementRowIgnored", () => {
		it("should never ignore any statement rows", () => {
			const contributionRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "Employee Contribution",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const feeRow = {
				...contributionRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Pre-tax": "0.00",
				Total: "5.00",
				"Transaction type": "Management Fee",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const matchRow = {
				...contributionRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				"Pre-tax": "250.00",
				Total: "250.00",
				"Transaction type": "Employer Match",
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
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "Employee Contribution",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors: string[] = [];
			const result = provider.validateIsStatementRow(validRow, errors);

			expect(result).toBe(true);
			expect(errors).toEqual([]);
		});

		it("should reject invalid rows with appropriate errors", () => {
			const emptyTransactionTypeRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const wrongShapeRow = {
				someField: "value",
			};

			const missingFieldsRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Total: "500.00",
				"Transaction type": "Employee Contribution",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors1: string[] = [];
			expect(
				provider.validateIsStatementRow(
					emptyTransactionTypeRow,
					errors1,
				),
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
				Employer: "ACME Corp",
				"Fulfilled date": "01/15/2024",
				"Pre-tax": "500.00",
				"Requested date": "01/10/2024",
				Roth: "0.00",
				Total: "500.00",
				"Transaction Id": "123456",
				"Transaction type": "Employee Contribution",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors = ["old error"];
			provider.validateIsStatementRow(validRow, errors);

			expect(errors).toEqual([]);
		});
	});
});
