import { buildTransaction } from "@tally/data-models/testing/fixtures";
import { withoutId } from "@tally/utilities/object/withoutId";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModalDefaultTransactionRule } from "../common/modalDefault";
import { usePostTransactionRule } from "../hooks/api/usePostTransactionRule";
import { RuleEditModal } from "../rulesTable/ruleEditModal";
import { TransactionsUploadResultDetails } from "./transactionsUploadResultDetails";
import { TransactionsUploadResultTransactionRow } from "./transactionsUploadResultTransactionRow";

vi.mock("../hooks/api/usePostTransactionRule", () => ({
	usePostTransactionRule: vi.fn(),
}));
vi.mock("../rulesTable/ruleEditModal", () => ({
	RuleEditModal: vi.fn(() => <div data-testid="rule-edit-modal" />),
}));
vi.mock("./transactionsUploadResultTransactionRow", () => ({
	TransactionsUploadResultTransactionRow: vi.fn(
		({ transaction }: { transaction: { merchant: string } }) => (
			<div data-testid="transaction-row">{transaction.merchant}</div>
		),
	),
}));

const postTransactionRuleAsync = vi.fn(() =>
	Promise.resolve({ success: true }),
);

const ignoredRow = Object.fromEntries([
	["Amount", "1.00"],
	["Description", "PAYMENT THANK YOU"],
]);
const failedRow = Object.fromEntries([
	["Amount", "oops"],
	["Description", "BROKEN ROW"],
]);

const lastRuleModalProps = () => vi.mocked(RuleEditModal).mock.lastCall?.[0];

const expand = (title: string) => {
	act(() => {
		fireEvent.click(screen.getByText(title));
	});
};

describe("TransactionsUploadResultDetails", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(usePostTransactionRule).mockReturnValue({
			postTransactionRuleAsync,
		});
	});

	it("summarizes and lists each group of upload results", () => {
		render(
			<TransactionsUploadResultDetails
				response={{
					rowsFailed: [],
					rowsIgnored: [ignoredRow],
					rowsProcessed: [
						buildTransaction({ id: 1, subcategoryId: 3 }),
						buildTransaction({
							id: 2,
							merchant: "Bakery",
							subcategoryId: -1,
						}),
					],
					success: true,
				}}
			/>,
		);

		for (const chip of [
			"1 categorized",
			"1 uncategorized",
			"1 ignored",
			"0 failed",
		]) {
			expect(screen.getByText(chip)).toBeInTheDocument();
		}

		expand("Uncategorized Transactions");
		expand("Ignored Transactions");

		expect(screen.getByTestId("transaction-row")).toHaveTextContent(
			"Bakery",
		);
		expect(screen.getByText("PAYMENT THANK YOU")).toBeInTheDocument();
	});

	it("shows failed rows with their error and original columns, separately from ignored rows", () => {
		render(
			<TransactionsUploadResultDetails
				response={{
					rowsFailed: [["Invalid amount", failedRow]],
					rowsIgnored: [ignoredRow],
					rowsProcessed: [],
					success: true,
				}}
			/>,
		);

		expand("Ignored Transactions");
		expand("Failed Transactions");

		expect(screen.getByText("Invalid amount")).toBeInTheDocument();
		expect(screen.getByText("BROKEN ROW")).toBeInTheDocument();
		expect(screen.getByText("PAYMENT THANK YOU")).toBeInTheDocument();
		expect(
			screen
				.getAllByRole("columnheader")
				.map(({ textContent }) => textContent),
		).toEqual(["Amount", "Description", "Error", "Amount", "Description"]);
	});

	it("opens the rule editor for an uncategorized merchant and saves the rule", async () => {
		render(
			<TransactionsUploadResultDetails
				response={{
					rowsFailed: [],
					rowsIgnored: [],
					rowsProcessed: [
						buildTransaction({
							merchant: "Bakery",
							subcategoryId: -1,
						}),
					],
					success: true,
				}}
			/>,
		);

		expect(lastRuleModalProps()).toMatchObject({
			merchantToMatch: undefined,
			rule: ModalDefaultTransactionRule,
		});

		expand("Uncategorized Transactions");
		act(() => {
			vi.mocked(
				TransactionsUploadResultTransactionRow,
			).mock.lastCall?.[0].onCreateRule();
		});

		expect(lastRuleModalProps()?.merchantToMatch).toBe("Bakery");
		expect(lastRuleModalProps()?.modalState.isOpen).toBe(true);

		await lastRuleModalProps()?.onSaveAsync(ModalDefaultTransactionRule);

		expect(postTransactionRuleAsync).toHaveBeenCalledWith(
			withoutId(ModalDefaultTransactionRule),
		);
	});
});
