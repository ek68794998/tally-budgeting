import { type Asset } from "@tally/data-models/contracts/asset";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import {
	DefaultSubcategoryId,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { beforeEach, describe, expect, it } from "vitest";
import { RipplingDataProvider } from "./rippling";
import { type TransactionCustomizations } from "./types";

const baseRow = {
	/* eslint-disable @typescript-eslint/naming-convention */
	"Attempted Amount": "50.00",
	Balance: "1000.00",
	Description: "Coffee purchase",
	"Final Transaction": "50.00",
	Merchant: "Blue Bottle Coffee",
	Status: "Completed",
	"Transaction date": "2024-03-15",
	"Transaction settlement date": "2024-03-16",
	"Transaction type": "Purchase",
	/* eslint-enable @typescript-eslint/naming-convention */
};

describe("RipplingDataProvider", () => {
	let provider: RipplingDataProvider;
	let customizations: TransactionCustomizations;
	let testAccount: Asset;
	let testSubcategory: Subcategory;

	beforeEach(() => {
		provider = new RipplingDataProvider();

		testSubcategory = {
			budget: {
				amountCents: 10000,
				frequency: 12,
				type: "expense",
			},
			categoryId: 5,
			description: "Food & Drink",
			id: 101,
			label: "Coffee",
			percentNeeds: 0,
			percentSavings: 0,
		};

		testAccount = {
			active: true,
			id: 1,
			name: "Rippling Card",
			provider: "rippling",
			type: "fixed_asset",
			valueCents: 0,
		};

		customizations = {
			accounts: [testAccount],
			merchants: [
				{
					categoryId: 101,
					friendlyName: "Blue Bottle Coffee",
					matcherRegex: /blue bottle/i,
				},
			],
			subcategories: [testSubcategory],
		};
	});

	describe("convertStatementRowToTransaction", () => {
		it("should convert a basic debit transaction", () => {
			const result = provider.convertStatementRowToTransaction(
				{ ...baseRow, "Final Transaction": "50.00" }, // eslint-disable-line @typescript-eslint/naming-convention
				"Rippling Card",
				customizations,
			);

			expect(result).toEqual({
				accountId: 1,
				amountCents: 5000,
				categoryId: 5,
				date: new Date("2024-03-15").toISOString(),
				merchant: "Blue Bottle Coffee",
				subcategoryId: 101,
				type: "debit",
			});
		});

		it("should convert a credit transaction when description is a withdrawal type", () => {
			const result = provider.convertStatementRowToTransaction(
				{ ...baseRow, Merchant: "Card Swipe" }, // eslint-disable-line @typescript-eslint/naming-convention
				"Rippling Card",
				customizations,
			);

			expect(result.type).toBe("credit");
		});

		it("should convert a debit transaction (negative amount)", () => {
			const result = provider.convertStatementRowToTransaction(
				{ ...baseRow, "Final Transaction": "-25.00" }, // eslint-disable-line @typescript-eslint/naming-convention
				"Rippling Card",
				customizations,
			);

			expect(result.type).toBe("debit");
			expect(result.amountCents).toBe(2500);
		});

		it("should match merchant via customizations", () => {
			const result = provider.convertStatementRowToTransaction(
				baseRow,
				"Rippling Card",
				customizations,
			);

			expect(result.merchant).toBe("Blue Bottle Coffee");
			expect(result.subcategoryId).toBe(101);
		});

		it("should use default subcategory when no merchant matches", () => {
			const result = provider.convertStatementRowToTransaction(
				{ ...baseRow, Merchant: "Unknown Vendor" }, // eslint-disable-line @typescript-eslint/naming-convention
				"Rippling Card",
				customizations,
			);

			expect(result.merchant).toBe("Unknown Vendor");
			expect(result.subcategoryId).toBe(DefaultSubcategoryId);
			expect(result.categoryId).toBe(DefaultCategoryId);
		});

		it("should strip dollar signs and commas from amount", () => {
			const result = provider.convertStatementRowToTransaction(
				{ ...baseRow, "Final Transaction": "$1,234.56" }, // eslint-disable-line @typescript-eslint/naming-convention
				"Rippling Card",
				customizations,
			);

			expect(result.amountCents).toBe(123456);
		});

		it("should trim whitespace from merchant", () => {
			const result = provider.convertStatementRowToTransaction(
				{ ...baseRow, Merchant: "  Blue Bottle Coffee  " }, // eslint-disable-line @typescript-eslint/naming-convention
				"Rippling Card",
				customizations,
			);

			expect(result.merchant).toBe("Blue Bottle Coffee");
		});

		it("should throw when account name not found", () => {
			expect(() =>
				provider.convertStatementRowToTransaction(
					baseRow,
					"Nonexistent Account",
					customizations,
				),
			).toThrow("Account with name 'Nonexistent Account' not found");
		});

		it("should throw when account exists but has wrong provider", () => {
			const wrongProviderCustomizations = {
				...customizations,
				accounts: [{ ...testAccount, provider: "chase" as const }],
			};

			expect(() =>
				provider.convertStatementRowToTransaction(
					baseRow,
					"Rippling Card",
					wrongProviderCustomizations,
				),
			).toThrow("does not match provider");
		});
	});

	describe("isStatementRowIgnored", () => {
		it("should never ignore any statement rows", () => {
			expect(provider.isStatementRowIgnored(baseRow)).toBe(false);
			expect(
				provider.isStatementRowIgnored({
					...baseRow,
					"Final Transaction": "-50.00", // eslint-disable-line @typescript-eslint/naming-convention
				}),
			).toBe(false);
		});
	});

	describe("validateIsStatementRow", () => {
		it("should validate a correct statement row", () => {
			const errors: string[] = [];
			expect(provider.validateIsStatementRow(baseRow, errors)).toBe(true);
			expect(errors).toHaveLength(0);
		});

		it.each([
			[
				"empty Final Transaction",
				{ ...baseRow, "Final Transaction": "" }, // eslint-disable-line @typescript-eslint/naming-convention
				[
					"Final Transaction: Too small: expected string to have >=1 characters",
				],
			],
			[
				"empty Transaction date",
				{ ...baseRow, "Transaction date": "" }, // eslint-disable-line @typescript-eslint/naming-convention
				[
					"Transaction date: Too small: expected string to have >=1 characters",
				],
			],
		])("should reject row with %s", (_label, row, expectedErrors) => {
			const errors: string[] = [];
			expect(provider.validateIsStatementRow(row, errors)).toBe(false);
			expect(errors).toEqual(expectedErrors);
		});

		it("should reject wrong-shape object with multiple errors", () => {
			const errors: string[] = [];
			expect(
				provider.validateIsStatementRow({ someField: "value" }, errors),
			).toBe(false);
			expect(errors.length).toBeGreaterThan(1);
		});

		it("should reject null and undefined", () => {
			const errors1: string[] = [];
			expect(provider.validateIsStatementRow(null, errors1)).toBe(false);
			expect(errors1).toHaveLength(1);

			const errors2: string[] = [];
			expect(provider.validateIsStatementRow(undefined, errors2)).toBe(
				false,
			);
			expect(errors2).toHaveLength(1);
		});

		it("should not clear a pre-populated errors array", () => {
			const errors = ["pre-existing error"];
			provider.validateIsStatementRow(baseRow, errors);
			expect(errors).toHaveLength(1);
		});
	});
});
