import { buildTransaction } from "@tally/data-models/testing/fixtures";
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

		expect(screen.getAllByText(/^\{count\} /u)).toHaveLength(4);

		expand("Uncategorized Transactions");
		expand("Ignored Transactions");

		expect(screen.getByTestId("transaction-row")).toHaveTextContent(
			"Bakery",
		);
		expect(screen.getByText("PAYMENT THANK YOU")).toBeInTheDocument();
	});

	// Known bug: the API sends failed rows as `[error, row]` tuples, but they are rendered as header-keyed records
	// (which also replaces the ignored rows' headers with "0" and "1").
	it.fails("shows the original columns of failed rows", () => {
		render(
			<TransactionsUploadResultDetails
				response={{
					rowsFailed: [["Invalid amount", failedRow]],
					rowsIgnored: [],
					rowsProcessed: [],
					success: true,
				}}
			/>,
		);

		expand("Failed Transactions");

		expect(screen.getByText("BROKEN ROW")).toBeInTheDocument();
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
			ModalDefaultTransactionRule,
		);
	});
});
