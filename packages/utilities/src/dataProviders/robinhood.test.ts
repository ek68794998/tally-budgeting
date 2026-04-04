import { type Asset } from "@tally/data-models/contracts/asset";
import { DefaultCategoryId } from "@tally/data-models/contracts/category";
import {
	DefaultSubcategoryId,
	type Subcategory,
} from "@tally/data-models/contracts/subcategory";
import { DateTime } from "luxon";
import { beforeEach, describe, expect, it } from "vitest";
import { RobinhoodDataProvider } from "./robinhood";
import { type TransactionCustomizations } from "./types";

describe("RobinhoodDataProvider", () => {
	let provider: RobinhoodDataProvider;
	let customizations: TransactionCustomizations;
	let testAccount: Asset;
	let testSubcategory: Subcategory;

	beforeEach(() => {
		provider = new RobinhoodDataProvider();

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
			name: "Robinhood Gold Card",
			provider: "robinhood",
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
				Amount: "5.50",
				Balance: "994.50",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "STARBUCKS COFFEE",
				Merchant: "Starbucks Coffee",
				Points: "5",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Robinhood Gold Card",
				customizations,
			);

			expect(result).toEqual({
				accountId: 1,
				amountCents: 550,
				categoryId: 5,
				date: DateTime.fromFormat(
					"2024-01-15 9:30 AM",
					"yyyy-MM-dd h:mm a",
				).toISO(),
				merchant: "Starbucks",
				subcategoryId: 101,
				type: "debit",
			});
		});

		it("should convert a credit/refund transaction", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "25.00",
				Balance: "1025.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "", // For declined transactions and refunds, description is empty.
				Merchant: "Starbucks Coffee",
				Points: "0",
				Status: "Posted",
				Time: "2:15 PM",
				Type: "Credit",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Robinhood Gold Card",
				customizations,
			);

			expect(result.type).toBe("credit");
			expect(result.amountCents).toBe(2500);
		});

		it("should handle various transaction types correctly", () => {
			const purchaseRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "TEST MERCHANT",
				Merchant: "Test Merchant",
				Points: "10",
				Status: "Posted",
				Time: "3:45 PM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const refundRow = {
				...purchaseRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Type: "Refund",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const adjustmentRow = {
				...purchaseRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "5.00",
				Type: "Adjustment",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const purchase = provider.convertStatementRowToTransaction(
				purchaseRow,
				"Robinhood Gold Card",
				customizations,
			);
			const refund = provider.convertStatementRowToTransaction(
				refundRow,
				"Robinhood Gold Card",
				customizations,
			);
			const adjustment = provider.convertStatementRowToTransaction(
				adjustmentRow,
				"Robinhood Gold Card",
				customizations,
			);

			expect(purchase.type).toBe("debit");
			expect(refund.type).toBe("credit");
			expect(adjustment.type).toBe("credit");
		});

		it("should handle various time formats", () => {
			const morningRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "TEST",
				Merchant: "Test",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const afternoonRow = {
				...morningRow,
				Time: "2:45 PM", // eslint-disable-line @typescript-eslint/naming-convention
			};

			const midnightRow = {
				...morningRow,
				Time: "12:00 AM", // eslint-disable-line @typescript-eslint/naming-convention
			};

			const noonRow = {
				...morningRow,
				Time: "12:00 PM", // eslint-disable-line @typescript-eslint/naming-convention
			};

			const morning = provider.convertStatementRowToTransaction(
				morningRow,
				"Robinhood Gold Card",
				customizations,
			);
			const afternoon = provider.convertStatementRowToTransaction(
				afternoonRow,
				"Robinhood Gold Card",
				customizations,
			);
			const midnight = provider.convertStatementRowToTransaction(
				midnightRow,
				"Robinhood Gold Card",
				customizations,
			);
			const noon = provider.convertStatementRowToTransaction(
				noonRow,
				"Robinhood Gold Card",
				customizations,
			);

			expect(morning.date).toBe(
				DateTime.fromFormat(
					"2024-01-15 9:30 AM",
					"yyyy-MM-dd h:mm a",
				).toISO(),
			);
			expect(afternoon.date).toBe(
				DateTime.fromFormat(
					"2024-01-15 2:45 PM",
					"yyyy-MM-dd h:mm a",
				).toISO(),
			);
			expect(midnight.date).toBe(
				DateTime.fromFormat(
					"2024-01-15 12:00 AM",
					"yyyy-MM-dd h:mm a",
				).toISO(),
			);
			expect(noon.date).toBe(
				DateTime.fromFormat(
					"2024-01-15 12:00 PM",
					"yyyy-MM-dd h:mm a",
				).toISO(),
			);
		});

		it("should handle invalid date/time by using current time", () => {
			const invalidRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "invalid-date",
				Description: "TEST",
				Merchant: "Test",
				Points: "10",
				Status: "Posted",
				Time: "invalid-time",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				invalidRow,
				"Robinhood Gold Card",
				customizations,
			);

			// Should use DateTime.now() which should be close to current time
			const resultDate = DateTime.fromISO(result.date);
			const now = DateTime.now();
			const diffInSeconds = Math.abs(
				resultDate.diff(now, "seconds").seconds,
			);

			expect(diffInSeconds).toBeLessThan(5); // Allow 5 second tolerance
		});

		it("should handle various amount formats correctly", () => {
			const smallAmountRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "0.50",
				Balance: "999.50",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "TEST",
				Merchant: "Test",
				Points: "0",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const largeAmountRow = {
				...smallAmountRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "1234.56",
				Balance: "-234.56",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const smallAmount = provider.convertStatementRowToTransaction(
				smallAmountRow,
				"Robinhood Gold Card",
				customizations,
			);
			const largeAmount = provider.convertStatementRowToTransaction(
				largeAmountRow,
				"Robinhood Gold Card",
				customizations,
			);

			expect(smallAmount.amountCents).toBe(50);
			expect(largeAmount.amountCents).toBe(123456);
		});

		it("should trim whitespace from merchant name", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "  STARBUCKS COFFEE  ",
				Merchant: "Starbucks Coffee",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Robinhood Gold Card",
				customizations,
			);

			expect(result.merchant).toBe("Starbucks");
		});

		it("should use default subcategory when no matching merchant found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "UNKNOWN MERCHANT",
				Merchant: "Unknown Merchant",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const result = provider.convertStatementRowToTransaction(
				row,
				"Robinhood Gold Card",
				customizations,
			);

			expect(result.merchant).toBe("UNKNOWN MERCHANT");
			expect(result.subcategoryId).toBe(DefaultSubcategoryId);
			expect(result.categoryId).toBe(DefaultCategoryId);
		});

		it("should throw error when account not found", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "TEST",
				Merchant: "Test",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
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
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "TEST",
				Merchant: "Test",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(() =>
				provider.convertStatementRowToTransaction(
					row,
					"Robinhood Gold Card",
					customizationsWithWrongProvider,
				),
			).toThrow("does not match provider");
		});

		describe("investment statement rows", () => {
			it("should convert a credit investment row", () => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Activity Date": "1/15/2024",
					Amount: "$25.00",
					Description: "AAPL Dividend",
					Instrument: "AAPL",
					Price: "$185.00",
					"Process Date": "1/15/2024",
					Quantity: "0",
					"Settle Date": "1/17/2024",
					"Trans Code": "DIV",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Robinhood Gold Card",
					customizations,
				);

				expect(result.type).toBe("credit");
				expect(result.amountCents).toBe(2500);
				expect(result.merchant).toBe("(AAPL) AAPL Dividend");
			});

			it("should convert a debit investment row with parenthesized amount", () => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Activity Date": "1/15/2024",
					Amount: "($50.00)",
					Description: "Interest Charged",
					Instrument: "",
					Price: "",
					"Process Date": "1/15/2024",
					Quantity: "0",
					"Settle Date": "1/17/2024",
					"Trans Code": "INTR",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Robinhood Gold Card",
					customizations,
				);

				expect(result.type).toBe("debit");
				expect(result.amountCents).toBe(5000);
			});

			it("should strip $ and commas from amount", () => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Activity Date": "1/15/2024",
					Amount: "$1,234.56",
					Description: "Large Credit",
					Instrument: "SPY",
					Price: "$450.00",
					"Process Date": "1/15/2024",
					Quantity: "0",
					"Settle Date": "1/17/2024",
					"Trans Code": "DIV",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Robinhood Gold Card",
					customizations,
				);

				expect(result.amountCents).toBe(123456);
			});

			it("should use just description when Instrument is empty", () => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Activity Date": "1/15/2024",
					Amount: "$10.00",
					Description: "Cash Interest",
					Instrument: "",
					Price: "",
					"Process Date": "1/15/2024",
					Quantity: "0",
					"Settle Date": "1/17/2024",
					"Trans Code": "INT",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Robinhood Gold Card",
					customizations,
				);

				expect(result.merchant).toBe("Cash Interest");
			});

			it("should parse date from Process Date field", () => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Activity Date": "1/10/2024",
					Amount: "$5.00",
					Description: "Dividend",
					Instrument: "VTI",
					Price: "$200.00",
					"Process Date": "1/15/2024",
					Quantity: "0",
					"Settle Date": "1/17/2024",
					"Trans Code": "DIV",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				const result = provider.convertStatementRowToTransaction(
					row,
					"Robinhood Gold Card",
					customizations,
				);

				expect(result.date).toBe(
					DateTime.fromFormat("1/15/2024", "M/d/yyyy").toISO(),
				);
			});
		});
	});

	describe("isStatementRowIgnored", () => {
		it("should ignore payment transactions", () => {
			const paymentRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "100.00",
				Balance: "900.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "Payment received",
				Merchant: "Payment",
				Points: "0",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Payment",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(provider.isStatementRowIgnored(paymentRow)).toBe(true);
		});

		it("should not ignore regular transactions", () => {
			const purchaseRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "STARBUCKS",
				Merchant: "Starbucks Coffee",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const refundRow = {
				...purchaseRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Description: "Refund",
				Merchant: "REFUND FROM STORE",
				Type: "Refund",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const creditRow = {
				...purchaseRow,
				/* eslint-disable @typescript-eslint/naming-convention */
				Description: "Credit",
				Merchant: "CREDIT",
				Type: "Credit",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(provider.isStatementRowIgnored(purchaseRow)).toBe(false);
			expect(provider.isStatementRowIgnored(refundRow)).toBe(false);
			expect(provider.isStatementRowIgnored(creditRow)).toBe(false);
		});

		describe("investment statement rows", () => {
			it.each([
				["Buy", "Buy"],
				["Sell", "Sell"],
			])("should ignore %s trans code", (_label, transCode) => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Activity Date": "1/15/2024",
					Amount: "$100.00",
					Description: "Some stock",
					Instrument: "AAPL",
					Price: "$185.00",
					"Process Date": "1/15/2024",
					Quantity: "1",
					"Settle Date": "1/17/2024",
					"Trans Code": transCode,
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				expect(provider.isStatementRowIgnored(row)).toBe(true);
			});

			it.each([
				["Dividend Reinvestment", "Dividend Reinvestment"],
				["DIVIDEND  REINVESTMENT", "DIVIDEND  REINVESTMENT"],
				["balance payment", "balance payment"],
				["auto balance payment", "auto balance payment"],
			])("should ignore description containing '%s'", (_label, description) => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Activity Date": "1/15/2024",
					Amount: "$10.00",
					Description: description,
					Instrument: "",
					Price: "",
					"Process Date": "1/15/2024",
					Quantity: "0",
					"Settle Date": "1/17/2024",
					"Trans Code": "MISC",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				expect(provider.isStatementRowIgnored(row)).toBe(true);
			});

			it("should not ignore dividend income (non-reinvestment)", () => {
				const row = {
					/* eslint-disable @typescript-eslint/naming-convention */
					"Activity Date": "1/15/2024",
					Amount: "$25.00",
					Description: "Dividend Income",
					Instrument: "AAPL",
					Price: "",
					"Process Date": "1/15/2024",
					Quantity: "0",
					"Settle Date": "1/17/2024",
					"Trans Code": "DIV",
					/* eslint-enable @typescript-eslint/naming-convention */
				};

				expect(provider.isStatementRowIgnored(row)).toBe(false);
			});
		});

		it("should not ignore transactions with payment in description", () => {
			const row = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "PAYMENT PROCESSING CO",
				Merchant: "Payment Processing",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			expect(provider.isStatementRowIgnored(row)).toBe(false);
		});
	});

	describe("validateIsStatementRow", () => {
		it("should validate a correct statement row", () => {
			const validRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "TEST MERCHANT",
				Merchant: "Test Merchant",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors: string[] = [];
			const result = provider.validateIsStatementRow(validRow, errors);

			expect(result).toBe(true);
			expect(errors).toHaveLength(0);
		});

		it("should reject invalid rows with appropriate errors", () => {
			const emptyMerchantRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "Purchase",
				Merchant: "",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const wrongShapeRow = {
				someField: "value",
			};

			const missingFieldsRow = {
				/* eslint-disable @typescript-eslint/naming-convention */
				Amount: "10.00",
				Merchant: "TEST",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors1: string[] = [];
			expect(
				provider.validateIsStatementRow(emptyMerchantRow, errors1),
			).toBe(false);
			expect(errors1).toHaveLength(1);

			const errors2: string[] = [];
			expect(
				provider.validateIsStatementRow(wrongShapeRow, errors2),
			).toBe(false);
			expect(errors2).toHaveLength(10);

			const errors3: string[] = [];
			expect(
				provider.validateIsStatementRow(missingFieldsRow, errors3),
			).toBe(false);
			expect(errors3).toHaveLength(8);

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
				Amount: "10.00",
				Balance: "990.00",
				Cardholder: "John Doe",
				Date: "2024-01-15",
				Description: "TEST",
				Merchant: "Test",
				Points: "10",
				Status: "Posted",
				Time: "9:30 AM",
				Type: "Purchase",
				/* eslint-enable @typescript-eslint/naming-convention */
			};

			const errors = ["old error"];
			provider.validateIsStatementRow(validRow, errors);

			expect(errors).toHaveLength(1);
		});
	});
});
