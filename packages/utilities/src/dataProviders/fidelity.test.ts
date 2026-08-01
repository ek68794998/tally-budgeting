import { type Asset } from "@tally/data-models/contracts/asset";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import {
	DefaultSubcategoryId,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { beforeEach, describe, expect, it } from "vitest";
import {
	FidelityDataProvider,
	type RetirementContributionRow,
} from "./fidelity";
import { type TransactionCustomizations } from "./types";

describe("FidelityDataProvider", () => {
	let provider: FidelityDataProvider;
	let customizations: TransactionCustomizations;
	let testAccount: Asset;
	let testSubcategory: Subcategory;

	beforeEach(() => {
		provider = new FidelityDataProvider();

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
			name: "Fidelity Cash Management",
			provider: "fidelity",
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
		describe("transaction rows", () => {
			it("should convert a basic debit transaction", () => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Accrued Interest ($)": "",
					Action: "DEBIT CARD PURCHASE STARBUCKS COFFEE",
					"Amount ($)": "-5.50",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Fidelity Cash Management",
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
					"Accrued Interest ($)": "",
					Action: "DIRECT DEPOSIT PAYROLL",
					"Amount ($)": "1500.00",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Fidelity Cash Management",
					customizations,
				);

				expect(result.type).toBe("credit");
				expect(result.amountCents).toBe(150000);
			});

			it("should handle bill payment transactions", () => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Accrued Interest ($)": "",
					Action: "BILL PAYMENT ELECTRIC COMPANY",
					"Amount ($)": "-125.50",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Fidelity Cash Management",
					customizations,
				);

				expect(result.type).toBe("debit");
				expect(result.amountCents).toBe(12550);
				expect(result.merchant).toBe("ELECTRIC COMPANY");
			});

			it("should trim boilerplate from description", () => {
				const billPaymentRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Accrued Interest ($)": "",
					Action: "BILL PAYMENT ELECTRIC COMPANY",
					"Amount ($)": "-100.00",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const debitCardRow = {
					...billPaymentRow,
					/* eslint-disable @typescript-eslint/naming-convention */
					Action: "DEBIT CARD PURCHASE STARBUCKS",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const billPayment = provider.convertStatementRowToTransaction(
					billPaymentRow,
					"Fidelity Cash Management",
					customizations,
				);
				const debitCard = provider.convertStatementRowToTransaction(
					debitCardRow,
					"Fidelity Cash Management",
					customizations,
				);

				expect(billPayment.merchant).toBe("ELECTRIC COMPANY");
				expect(debitCard.merchant).toBe("Starbucks");
			});

			it("should handle various amount formats correctly", () => {
				const negativeRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Accrued Interest ($)": "",
					Action: "DEBIT CARD PURCHASE TEST",
					"Amount ($)": "-15.75",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const positiveRow = {
					...negativeRow,
					/* eslint-disable @typescript-eslint/naming-convention */
					"Amount ($)": "99.99",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const negative = provider.convertStatementRowToTransaction(
					negativeRow,
					"Fidelity Cash Management",
					customizations,
				);
				const positive = provider.convertStatementRowToTransaction(
					positiveRow,
					"Fidelity Cash Management",
					customizations,
				);

				expect(negative.amountCents).toBe(1575);
				expect(negative.type).toBe("debit");
				expect(positive.amountCents).toBe(9999);
				expect(positive.type).toBe("credit");
			});

			it("should use default subcategory when no matching merchant found", () => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Accrued Interest ($)": "",
					Action: "DEBIT UNKNOWN MERCHANT",
					"Amount ($)": "-10.00",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Fidelity Cash Management",
					customizations,
				);

				expect(result.merchant).toBe("DEBIT UNKNOWN MERCHANT");
				expect(result.subcategoryId).toBe(DefaultSubcategoryId);
				expect(result.categoryId).toBe(DefaultCategoryId);
			});
		});

		describe("retirement contribution rows", () => {
			it("should convert a retirement contribution", () => {
				const row: RetirementContributionRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Amount ($)": "500.00",
					Date: "01/15/2024",
					Investment: "FIDELITY 500 INDEX FUND",
					"Shares/Unit": "2.5",
					"Transaction Type": "Contributions",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Fidelity Cash Management",
					customizations,
				);

				expect(result).toEqual({
					accountId: 1,
					amountCents: 50000,
					categoryId: DefaultCategoryId,
					date: new Date("01/15/2024").toISOString(),
					merchant: "FIDELITY 500 INDEX FUND",
					subcategoryId: DefaultSubcategoryId,
					type: "credit",
				});
			});

			it("should handle negative amounts in retirement contributions", () => {
				const row: RetirementContributionRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Amount ($)": "-100.00",
					Date: "01/15/2024",
					Investment: "FIDELITY 500 INDEX FUND",
					"Shares/Unit": "0.5",
					"Transaction Type": "Contributions",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Fidelity Cash Management",
					customizations,
				);

				expect(result.type).toBe("debit");
				expect(result.amountCents).toBe(10000);
			});
		});

		it("should throw error when account not found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Accrued Interest ($)": "",
				Action: "DEBIT TEST",
				"Amount ($)": "-10.00",
				"Commission ($)": "",
				Description: "",
				"Fees ($)": "",
				"Price ($)": "",
				Quantity: "",
				"Run Date": "01/15/2024",
				"Settlement Date": "01/15/2024",
				Symbol: "",
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
				"Accrued Interest ($)": "",
				Action: "DEBIT TEST",
				"Amount ($)": "-10.00",
				"Commission ($)": "",
				Description: "",
				"Fees ($)": "",
				"Price ($)": "",
				Quantity: "",
				"Run Date": "01/15/2024",
				"Settlement Date": "01/15/2024",
				Symbol: "",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(() =>
				provider.convertStatementRowToTransaction(
					row,
					"Fidelity Cash Management",
					customizationsWithWrongProvider,
				),
			).toThrow("does not match provider");
		});
	});

	describe("isStatementRowIgnored", () => {
		describe("transaction rows", () => {
			it("should not ignore bill payment transactions", () => {
				const billPaymentRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Accrued Interest ($)": "",
					Action: "BILL PAYMENT ELECTRIC COMPANY",
					"Amount ($)": "-100.00",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const billPaymentNoSpaceRow = {
					...billPaymentRow,
					Action: "BILLPAYMENT TEST", // eslint-disable-line @typescript-eslint/naming-convention
				};

				expect(provider.isStatementRowIgnored(billPaymentRow)).toBe(
					false,
				);
				expect(
					provider.isStatementRowIgnored(billPaymentNoSpaceRow),
				).toBe(false);
			});

			it("should not ignore debit transactions", () => {
				const debitRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Accrued Interest ($)": "",
					Action: "DEBIT CARD PURCHASE STORE",
					"Amount ($)": "-50.00",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				expect(provider.isStatementRowIgnored(debitRow)).toBe(false);
			});

			it("should not ignore contribution transactions", () => {
				const coContrRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Accrued Interest ($)": "",
					Action: "CO CONTR 401K",
					"Amount ($)": "500.00",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const particContrRow = {
					...coContrRow,
					Action: "PARTIC CONTR 401K", // eslint-disable-line @typescript-eslint/naming-convention
				};

				expect(provider.isStatementRowIgnored(coContrRow)).toBe(false);
				expect(provider.isStatementRowIgnored(particContrRow)).toBe(
					false,
				);
			});

			it("should ignore transactions that don't match patterns", () => {
				const transferRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Accrued Interest ($)": "",
					Action: "TRANSFER TO SAVINGS",
					"Amount ($)": "-1000.00",
					"Commission ($)": "",
					Description: "",
					"Fees ($)": "",
					"Price ($)": "",
					Quantity: "",
					"Run Date": "01/15/2024",
					"Settlement Date": "01/15/2024",
					Symbol: "",
					Type: "",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const feeRow = {
					...transferRow,
					Action: "MONTHLY MAINTENANCE FEE", // eslint-disable-line @typescript-eslint/naming-convention
				};

				expect(provider.isStatementRowIgnored(transferRow)).toBe(true);
				expect(provider.isStatementRowIgnored(feeRow)).toBe(true);
			});
		});

		describe("retirement contribution rows", () => {
			it.each([
				"Contributions",
				"Interest",
			])("should not ignore %s transactions", (transactionType) => {
				const row: RetirementContributionRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Amount ($)": "500.00",
					Date: "01/15/2024",
					Investment: "FIDELITY 500 INDEX FUND",
					"Shares/Unit": "2.5",
					"Transaction Type": transactionType,
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				expect(provider.isStatementRowIgnored(row)).toBe(false);
			});

			it("should ignore other retirement transactions", () => {
				const dividendRow: RetirementContributionRow = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Amount ($)": "25.00",
					Date: "01/15/2024",
					Investment: "FIDELITY 500 INDEX FUND",
					"Shares/Unit": "0",
					"Transaction Type": "Dividend",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const rebalanceRow: RetirementContributionRow = {
					...dividendRow,
					/* eslint-disable @typescript-eslint/naming-convention */
					"Transaction Type": "Rebalance",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				expect(provider.isStatementRowIgnored(dividendRow)).toBe(true);
				expect(provider.isStatementRowIgnored(rebalanceRow)).toBe(true);
			});
		});
	});

	describe("validateIsStatementRow", () => {
		it("should validate a correct transaction row", () => {
			const validRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Accrued Interest ($)": "",
				Action: "DEBIT CARD PURCHASE TEST",
				"Amount ($)": "-10.00",
				"Commission ($)": "",
				Description: "",
				"Fees ($)": "",
				"Price ($)": "",
				Quantity: "",
				"Run Date": "01/15/2024",
				"Settlement Date": "01/15/2024",
				Symbol: "",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors: string[] = [];
			const result = provider.validateIsStatementRow(validRow, errors);

			expect(result).toBe(true);
			expect(errors).toHaveLength(0);
		});

		it("should validate a correct retirement contribution row", () => {
			const validRow: RetirementContributionRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Amount ($)": "500.00",
				Date: "01/15/2024",
				Investment: "FIDELITY 500 INDEX FUND",
				"Shares/Unit": "2.5",
				"Transaction Type": "Contributions",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors: string[] = [];
			const result = provider.validateIsStatementRow(validRow, errors);

			expect(result).toBe(true);
			expect(errors).toHaveLength(0);
		});

		it("should reject transaction rows with empty action", () => {
			const emptyActionRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Accrued Interest ($)": "",
				Action: "",
				"Amount ($)": "-10.00",
				"Commission ($)": "",
				Description: "",
				"Fees ($)": "",
				"Price ($)": "",
				Quantity: "",
				"Run Date": "01/15/2024",
				"Settlement Date": "01/15/2024",
				Symbol: "",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors: string[] = [];
			expect(
				provider.validateIsStatementRow(emptyActionRow, errors),
			).toBe(false);
			expect(errors).toContain(
				"Action: Too small: expected string to have >=1 characters",
			);
		});

		it("should reject invalid rows with appropriate errors", () => {
			const wrongShapeRow = {
				someField: "value",
			};

			const missingFieldsRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Action: "TEST",
				"Amount ($)": "-10.00",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors1: string[] = [];
			expect(
				provider.validateIsStatementRow(wrongShapeRow, errors1),
			).toBe(false);
			expect(errors1).toHaveLength(12);

			const errors2: string[] = [];
			expect(
				provider.validateIsStatementRow(missingFieldsRow, errors2),
			).toBe(false);
			expect(errors2).toHaveLength(10);

			const errors3: string[] = [];
			expect(provider.validateIsStatementRow(null, errors3)).toBe(false);
			expect(errors3).toHaveLength(1);

			const errors4: string[] = [];
			expect(provider.validateIsStatementRow(undefined, errors4)).toBe(
				false,
			);
			expect(errors4).toHaveLength(1);
		});

		it("should not clear validation errors array before validation", () => {
			const validRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				"Accrued Interest ($)": "",
				Action: "DEBIT TEST",
				"Amount ($)": "-10.00",
				"Commission ($)": "",
				Description: "",
				"Fees ($)": "",
				"Price ($)": "",
				Quantity: "",
				"Run Date": "01/15/2024",
				"Settlement Date": "01/15/2024",
				Symbol: "",
				Type: "",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors = ["old error"];
			provider.validateIsStatementRow(validRow, errors);

			expect(errors).toHaveLength(1);
		});
	});
});
