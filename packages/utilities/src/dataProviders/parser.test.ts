import { type Asset } from "@tally/data-models/contracts/asset";
import { describe, expect, it } from "vitest";
import { parseRowAsTransaction } from "./parser";
import { type TransactionCustomizations } from "./types";

const makeAccount = (
	provider: Asset["provider"],
	name = "Test Account",
): Asset => ({
	active: true,
	id: 1,
	name,
	provider,
	type: "short_term_liability",
	valueCents: 0,
});

const baseCustomizations: TransactionCustomizations = {
	accounts: [],
	merchants: [],
	subcategories: [],
};

const robinhoodRow = {
	/* eslint-disable @typescript-eslint/naming-convention */
	Amount: "10.00",
	Balance: "990.00",
	Cardholder: "John Doe",
	Date: "2024-01-15",
	Description: "COFFEE SHOP",
	Merchant: "Coffee Shop",
	Points: "10",
	Status: "Posted",
	Time: "9:30 AM",
	Type: "Purchase",
	/* eslint-enable @typescript-eslint/naming-convention */
};

const appleRow = {
	/* eslint-disable @typescript-eslint/naming-convention */
	"Amount (USD)": "-10.00",
	Category: "Food",
	"Clearing Date": "01/16/2024",
	Description: "COFFEE SHOP",
	Merchant: "Coffee Shop",
	"Purchased By": "John",
	"Transaction Date": "01/15/2024",
	Type: "Purchase",
	/* eslint-enable @typescript-eslint/naming-convention */
};

const chaseRow = {
	/* eslint-disable @typescript-eslint/naming-convention */
	Amount: "-10.00",
	Category: "Food & Drink",
	Description: "COFFEE SHOP",
	Memo: "",
	"Post Date": "01/16/2024",
	"Transaction Date": "01/15/2024",
	Type: "Sale",
	/* eslint-enable @typescript-eslint/naming-convention */
};

const fidelityRow = {
	/* eslint-disable @typescript-eslint/naming-convention */
	"Accrued Interest ($)": "",
	Action: "DEBIT",
	"Amount ($)": "-100.00",
	"Commission ($)": "",
	Description: "VTSAX",
	"Fees ($)": "",
	"Price ($)": "100.00",
	Quantity: "1",
	"Run Date": "01/15/2024",
	"Settlement Date": "01/17/2024",
	Symbol: "VTSAX",
	Type: "",
	/* eslint-enable @typescript-eslint/naming-convention */
};

const ftfcuRow = {
	/* eslint-disable @typescript-eslint/naming-convention */
	Amount: "-10.00",
	Balance: "990.00",
	"Check Number": "",
	Description: "COFFEE SHOP",
	"Effective Date": "01/15/2024",
	"Extended Description": "",
	Memo: "",
	"Posting Date": "01/15/2024",
	"Reference Number": "REF123",
	"Transaction Category": "Food",
	"Transaction ID": "TXN123",
	"Transaction Type": "Debit",
	Type: "Debit",
	/* eslint-enable @typescript-eslint/naming-convention */
};

const ripplingRow = {
	/* eslint-disable @typescript-eslint/naming-convention */
	"Attempted Amount": "-10.00",
	Balance: "990.00",
	Description: "COFFEE SHOP",
	"Final Transaction": "-10.00",
	Merchant: "Coffee Shop",
	Status: "Completed",
	"Transaction date": "2024-01-15",
	"Transaction settlement date": "2024-01-16",
	"Transaction type": "Card Swipe",
	/* eslint-enable @typescript-eslint/naming-convention */
};

const guidelineRow = {
	/* eslint-disable @typescript-eslint/naming-convention */
	Employer: "Acme Corp",
	"Fulfilled date": "01/15/2024",
	"Pre-tax": "100.00",
	"Requested date": "01/14/2024",
	Roth: "0.00",
	Total: "100.00",
	"Transaction Id": "G123",
	"Transaction type": "Employee contribution",
	/* eslint-enable @typescript-eslint/naming-convention */
};

describe("parseRowAsTransaction", () => {
	it("throws when account.provider is null", () => {
		const account = makeAccount(null);

		expect(() =>
			parseRowAsTransaction(robinhoodRow, account, baseCustomizations),
		).toThrow();
	});

	describe("result: success", () => {
		it.each([
			["robinhood", robinhoodRow, makeAccount("robinhood")],
			["apple", appleRow, makeAccount("apple")],
			["chase", chaseRow, makeAccount("chase")],
			["fidelity", fidelityRow, makeAccount("fidelity")],
			["firstTechFederal", ftfcuRow, makeAccount("firstTechFederal")],
			["guideline", guidelineRow, makeAccount("guideline")],
			["rippling", ripplingRow, makeAccount("rippling")],
		])("returns success for a valid %s row", (_provider, row, account) => {
			const customizations = {
				...baseCustomizations,
				accounts: [account],
			};
			const result = parseRowAsTransaction(row, account, customizations);

			expect(result.result).toBe("success");

			if (result.result === "success") {
				expect(result.transaction).toBeDefined();
				expect(result.transaction.id).toBe(-1);
				expect(result.transaction.notes).toBe("");
			}
		});
	});

	describe("result: failure", () => {
		it.each([
			["wrong shape", { someUnknownField: "value" }],
			["null", null],
		])("returns failure for a %s row", (_label, invalidRow) => {
			const account = makeAccount("robinhood");
			const customizations = {
				...baseCustomizations,
				accounts: [account],
			};

			const result = parseRowAsTransaction(
				invalidRow,
				account,
				customizations,
			);

			expect(result.result).toBe("failure");

			if (result.result === "failure") {
				expect(result.errors.length).toBeGreaterThan(0);
			}
		});
	});

	describe("result: ignore", () => {
		it("returns ignore for a Robinhood Payment row", () => {
			const account = makeAccount("robinhood");
			const customizations = {
				...baseCustomizations,
				accounts: [account],
			};
			const paymentRow = { ...robinhoodRow, Merchant: "Payment" }; // eslint-disable-line @typescript-eslint/naming-convention

			const result = parseRowAsTransaction(
				paymentRow,
				account,
				customizations,
			);

			expect(result.result).toBe("ignore");
		});
	});
});
