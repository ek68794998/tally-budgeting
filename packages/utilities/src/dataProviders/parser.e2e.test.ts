import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type Asset } from "@tally/data-models/contracts/asset";
import { type TransactionDirection } from "@tally/data-models/contracts/transactionDirection";
import { describe, expect, it } from "vitest";
import { getCsvRows, processCsvFile } from "../dataHandlers/csv";
import { parseRowAsTransaction } from "./parser";
import { type TransactionCustomizations } from "./types";

const mocksDir = join(__dirname, "__mocks__");

const readMock = (filename: string) =>
	readFileSync(join(mocksDir, filename), "utf-8");

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

const parseFile = (csvContent: string, account: Asset) => {
	const customizations: TransactionCustomizations = {
		accounts: [account],
		merchants: [],
		subcategories: [],
	};
	const rows = getCsvRows(processCsvFile(csvContent));
	return rows.map((row) =>
		parseRowAsTransaction(row, account, customizations),
	);
};

describe("parser e2e", () => {
	describe("chase", () => {
		const account = makeAccount("chase");
		const results = parseFile(readMock("chaseStatementMock.csv"), account);
		const successes = results.flatMap((r) =>
			r.result === "success" ? [r.transaction] : [],
		);

		it("produces 3 successes and 1 ignored from 4 rows", () => {
			expect(results).toHaveLength(4);
			expect(successes).toHaveLength(3);
			expect(results.filter((r) => r.result === "ignore")).toHaveLength(
				1,
			);
			expect(results.filter((r) => r.result === "failure")).toHaveLength(
				0,
			);
		});

		it("ignores the automatic payment row", () => {
			const ignored = results.filter((r) => r.result === "ignore");
			// Automatic payment row is row index 0
			expect(ignored).toHaveLength(1);
		});

		it.each<[number, number, TransactionDirection]>([
			[0, 500, "debit"],
			[1, 500, "debit"],
			[2, 50000, "debit"],
		])("success[%i] has amountCents=%i and type=%s", (index, amountCents, type) => {
			expect(successes[index]?.amountCents).toBe(amountCents);
			expect(successes[index]?.type).toBe(type);
		});
	});

	describe("fidelity HSA", () => {
		const account = makeAccount("fidelity");
		const results = parseFile(
			readMock("fidelityHsaStatementMock.csv"),
			account,
		);
		const successes = results.flatMap((r) =>
			r.result === "success" ? [r.transaction] : [],
		);

		it("produces 3 successes and 1 ignored from 4 rows", () => {
			expect(results).toHaveLength(4);
			expect(successes).toHaveLength(3);
			expect(results.filter((r) => r.result === "ignore")).toHaveLength(
				1,
			);
			expect(results.filter((r) => r.result === "failure")).toHaveLength(
				0,
			);
		});

		it.each<[number, number, TransactionDirection]>([
			// DIVIDEND RECEIVED → credit $5.00
			[0, 500, "credit"],
			// DEBIT CARD PURCHASE Amazon.com → debit $10.00
			[1, 1000, "debit"],
			// NORMAL DISTR PARTIAL DEBIT BUSINESSOLVER → debit $12.34
			[2, 1234, "debit"],
		])("success[%i] has amountCents=%i and type=%s", (index, amountCents, type) => {
			expect(successes[index]?.amountCents).toBe(amountCents);
			expect(successes[index]?.type).toBe(type);
		});
	});

	describe("fidelity investments", () => {
		const account = makeAccount("fidelity");
		const results = parseFile(
			readMock("fidelityInvestmentsStatementMock.csv"),
			account,
		);
		const successes = results.flatMap((r) =>
			r.result === "success" ? [r.transaction] : [],
		);

		it("produces 2 successes and 1 ignored from 3 rows", () => {
			expect(results).toHaveLength(3);
			expect(successes).toHaveLength(2);
			expect(results.filter((r) => r.result === "ignore")).toHaveLength(
				1,
			);
			expect(results.filter((r) => r.result === "failure")).toHaveLength(
				0,
			);
		});

		it.each<[number, number, TransactionDirection]>([
			// INTEREST EARNED → credit $7.00
			[0, 700, "credit"],
			// DIVIDEND RECEIVED CONTOSO LTD → credit $123.00
			[1, 12300, "credit"],
		])("success[%i] has amountCents=%i and type=%s", (index, amountCents, type) => {
			expect(successes[index]?.amountCents).toBe(amountCents);
			expect(successes[index]?.type).toBe(type);
		});
	});

	describe("fidelity retirement", () => {
		const account = makeAccount("fidelity");
		const results = parseFile(
			readMock("fidelityRetirementStatementMock.csv"),
			account,
		);
		const successes = results.flatMap((r) =>
			r.result === "success" ? [r.transaction] : [],
		);

		it("produces 2 successes and 1 ignored from 3 rows", () => {
			expect(results).toHaveLength(3);
			expect(successes).toHaveLength(2);
			expect(results.filter((r) => r.result === "ignore")).toHaveLength(
				1,
			);
			expect(results.filter((r) => r.result === "failure")).toHaveLength(
				0,
			);
		});

		it.each([0, 1])("success[%i] is a $100.00 credit", (index) => {
			expect(successes[index]?.amountCents).toBe(10000);
			expect(successes[index]?.type).toBe("credit");
		});
	});

	describe("first tech federal", () => {
		const account = makeAccount("firstTechFederal");
		const results = parseFile(
			readMock("firstTechStatementMock.csv"),
			account,
		);
		const successes = results.flatMap((r) =>
			r.result === "success" ? [r.transaction] : [],
		);

		it("produces 3 successes and 2 ignored from 5 rows", () => {
			expect(results).toHaveLength(5);
			expect(successes).toHaveLength(3);
			expect(results.filter((r) => r.result === "ignore")).toHaveLength(
				2,
			);
			expect(results.filter((r) => r.result === "failure")).toHaveLength(
				0,
			);
		});

		it("ignores transfer rows referencing masked account numbers", () => {
			// Rows 3 and 4 are Withdrawal/Deposit transfers with ******1234
			const ignored = results.filter((r) => r.result === "ignore");
			expect(ignored).toHaveLength(2);
		});

		it.each<[number, number, TransactionDirection]>([
			// ACH Deposit CONTOSO PAYROLL → credit $10,000.00
			[0, 1000000, "credit"],
			// ACH Debit FIDELITY DEBITS → debit $5,000.00
			[1, 500000, "debit"],
			// POS Transaction ContosoShops.biz → debit $100.00
			[2, 10000, "debit"],
		])("success[%i] has amountCents=%i and type=%s", (index, amountCents, type) => {
			expect(successes[index]?.amountCents).toBe(amountCents);
			expect(successes[index]?.type).toBe(type);
		});
	});

	describe("guideline", () => {
		const account = makeAccount("guideline");
		const results = parseFile(
			readMock("guidelineStatementMock.csv"),
			account,
		);
		const successes = results.flatMap((r) =>
			r.result === "success" ? [r.transaction] : [],
		);

		it("produces 4 successes and 0 ignored from 4 rows", () => {
			expect(results).toHaveLength(4);
			expect(successes).toHaveLength(4);
			expect(results.filter((r) => r.result === "ignore")).toHaveLength(
				0,
			);
			expect(results.filter((r) => r.result === "failure")).toHaveLength(
				0,
			);
		});

		it.each<[number, number, TransactionDirection]>([
			// Dividend → credit $2.00
			[0, 200, "credit"],
			// Guideline Investments Account Fee → debit $1.00
			[1, 100, "debit"],
			// Payroll → credit $833.33
			[2, 83333, "credit"],
			// Dividend → credit $2.00
			[3, 200, "credit"],
		])("success[%i] has amountCents=%i and type=%s", (index, amountCents, type) => {
			expect(successes[index]?.amountCents).toBe(amountCents);
			expect(successes[index]?.type).toBe(type);
		});
	});

	describe("robinhood card", () => {
		const account = makeAccount("robinhood");
		const results = parseFile(
			readMock("robinhoodCardStatementMock.csv"),
			account,
		);
		const successes = results.flatMap((r) =>
			r.result === "success" ? [r.transaction] : [],
		);

		it("produces 3 successes and 2 ignored from 5 rows", () => {
			expect(results).toHaveLength(5);
			expect(successes).toHaveLength(3);
			expect(results.filter((r) => r.result === "ignore")).toHaveLength(
				2,
			);
			expect(results.filter((r) => r.result === "failure")).toHaveLength(
				0,
			);
		});

		it("ignores the declined transaction and the payment row", () => {
			// Row index 1 is Declined; row index 3 is Payment
			expect(results[1]?.result).toBe("ignore");
			expect(results[3]?.result).toBe("ignore");
		});

		it.each<[number, number, TransactionDirection]>([
			// Teo's Market purchase → debit $13.99
			[0, 1399, "debit"],
			// Refund: Expedia → credit $500.00
			[1, 50000, "credit"],
			// Sal's Pizzeria purchase → debit $13.99
			[2, 1399, "debit"],
		])("success[%i] has amountCents=%i and type=%s", (index, amountCents, type) => {
			expect(successes[index]?.amountCents).toBe(amountCents);
			expect(successes[index]?.type).toBe(type);
		});
	});

	describe("rippling", () => {
		const account = makeAccount("rippling");
		const results = parseFile(
			readMock("ripplingStatementMock.csv"),
			account,
		);
		const successes = results.flatMap((r) =>
			r.result === "success" ? [r.transaction] : [],
		);

		it("produces 7 successes and 0 ignored from 7 rows", () => {
			expect(results).toHaveLength(7);
			expect(successes).toHaveLength(7);
			expect(results.filter((r) => r.result === "ignore")).toHaveLength(
				0,
			);
			expect(results.filter((r) => r.result === "failure")).toHaveLength(
				0,
			);
		});

		it.each<[number, number, TransactionDirection]>([
			// Pre-tax contribution → debit $1.50
			[0, 150, "debit"],
			// Pre-tax contribution → debit $2.50
			[1, 250, "debit"],
			// Pre-tax contribution → debit $1.50
			[2, 150, "debit"],
			// Pre-tax contribution → debit $2.50
			[3, 250, "debit"],
			// Investment Dividend → debit $0.01
			[4, 1, "debit"],
			// Card swipe at What's Up, Doc → debit $690.00
			[5, 69000, "debit"],
			// Interest accrual for Dec 2025 → debit $0.01
			[6, 1, "debit"],
		])("success[%i] has amountCents=%i and type=%s", (index, amountCents, type) => {
			expect(successes[index]?.amountCents).toBe(amountCents);
			expect(successes[index]?.type).toBe(type);
		});
	});

	describe("robinhood investments", () => {
		const account = makeAccount("robinhood");
		const results = parseFile(
			readMock("robinhoodInvestmentsMock.csv"),
			account,
		);
		const successes = results.flatMap((r) =>
			r.result === "success" ? [r.transaction] : [],
		);

		it("produces 6 successes and 1 ignored from 7 rows", () => {
			expect(results).toHaveLength(7);
			expect(successes).toHaveLength(6);
			expect(results.filter((r) => r.result === "ignore")).toHaveLength(
				1,
			);
			expect(results.filter((r) => r.result === "failure")).toHaveLength(
				0,
			);
		});

		it("ignores the Buy (dividend reinvestment) row", () => {
			// The Buy row is index 4 (multi-line description with Dividend Reinvestment)
			expect(results[4]?.result).toBe("ignore");
		});

		it.each<[number, number, TransactionDirection]>([
			// Brokerage-held Cash Interest Payment → credit $1.50
			[0, 150, "credit"],
			// Interest Payment → credit $0.50
			[1, 50, "credit"],
			// Gold Deposit Boost Payment → credit $1.50
			[2, 150, "credit"],
			// CONTOSOLTD (NOA) → credit $1,000.00
			[3, 100000, "credit"],
			// Cash Div FAKE (CDIV) → credit $100.00
			[4, 10000, "credit"],
			// Cash Adjustment (JNLC) → debit $5.00 — exercises the ($X.XX) amount branch
			[5, 500, "debit"],
		])("success[%i] has amountCents=%i and type=%s", (index, amountCents, type) => {
			expect(successes[index]?.amountCents).toBe(amountCents);
			expect(successes[index]?.type).toBe(type);
		});
	});
});
