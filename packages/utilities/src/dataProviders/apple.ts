import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
import { type TransactionDirection } from "@tally/data-models/contracts/transactionDirection";
import { z } from "zod";
import { parseDescription } from "../dataHandlers/parseDescription";
import { Dollars } from "../financial/dollars";
import { validateIsStatementRow } from "./helpers";
import {
	type CsvRowToTransactionFn,
	type DataProvider,
	type ValidationErrorFn,
} from "./types";

const statementRowSchema = z.object({
	/* eslint-disable @typescript-eslint/naming-convention */
	"Amount (USD)": z.string(),
	Category: z.string(),
	"Clearing Date": z.string(),
	Description: z.string().min(1),
	Merchant: z.string(),
	"Purchased By": z.string(),
	"Transaction Date": z.string(),
	Type: z.string(),
	/* eslint-enable @typescript-eslint/naming-convention */
});

type StatementRow = z.infer<typeof statementRowSchema>;

export class AppleDataProvider implements DataProvider<StatementRow> {
	public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
		(inputRow, accountName, customizations) => {
			const { accounts, subcategories } = customizations;

			const { merchant, subcategoryId } = parseDescription(
				inputRow.Description,
				customizations,
			);

			const account = accounts.find(
				(a) => a.name === accountName && a.provider === "apple",
			);
			invariant(
				account,
				`Account with name '${accountName}' not found or does not match provider.`,
			);

			const subcategory =
				subcategories.find((s) => s.id === subcategoryId) ??
				DefaultSubcategory;

			const transactionType: TransactionDirection =
				inputRow.Type === "Purchase" ? "debit" : "credit";

			return {
				accountId: account.id,
				amountCents: Math.abs(
					Dollars.toCents(inputRow["Amount (USD)"]),
				),
				categoryId: subcategory.categoryId,
				date: new Date(inputRow["Transaction Date"]).toISOString(),
				merchant,
				subcategoryId: subcategory.id,
				type: transactionType,
			};
		};

	public isStatementRowIgnored = (inputRow: StatementRow) =>
		inputRow.Type === "Payment" ||
		inputRow.Description.toUpperCase() === "DAILY CASH ADJUSTMENT";

	public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
		obj,
		validationErrors,
	): obj is StatementRow =>
		validateIsStatementRow(obj, statementRowSchema, validationErrors);
}
