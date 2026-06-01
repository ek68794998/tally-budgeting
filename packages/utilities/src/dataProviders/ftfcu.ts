import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
import { transactionDirectionSchema } from "@tally/data-models/contracts/transactionDirection";
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
	Amount: z.string(),
	Balance: z.string(),
	"Check Number": z.string(),
	Description: z.string().min(1),
	"Effective Date": z.string(),
	"Extended Description": z.string(),
	Memo: z.string(),
	"Posting Date": z.string(),
	"Reference Number": z.string(),
	"Transaction Category": z.string(),
	"Transaction ID": z.string(),
	"Transaction Type": z.string(),
	Type: z.string(),
	/* eslint-enable @typescript-eslint/naming-convention */
});

type StatementRow = z.infer<typeof statementRowSchema>;

class FtfcuDataProvider implements DataProvider<StatementRow> {
	public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
		(inputRow, accountName, customizations) => {
			const { accounts, subcategories } = customizations;

			const description = trimBoilerplateFromDescription(
				inputRow.Description,
			);
			const { merchant, subcategoryId } = parseDescription(
				description,
				customizations,
			);

			const account = accounts.find(
				(a) =>
					a.name === accountName && a.provider === "firstTechFederal",
			);
			invariant(
				account,
				`Account with name '${accountName}' not found or does not match provider.`,
			);

			const subcategory =
				subcategories.find((s) => s.id === subcategoryId) ??
				DefaultSubcategory;

			const transactionType = inputRow["Transaction Type"].toLowerCase();
			const transactionDirection =
				transactionType === "check" ? "debit" : transactionType;

			return {
				accountId: account.id,
				amountCents: Math.abs(Dollars.toCents(inputRow.Amount)),
				categoryId: subcategory.categoryId,
				date: new Date(inputRow["Posting Date"]).toISOString(),
				merchant,
				subcategoryId: subcategory.id,
				type: transactionDirectionSchema.parse(transactionDirection),
			};
		};

	public isStatementRowIgnored = (inputRow: StatementRow) => {
		const { Description: description } = inputRow;

		return !!(
			/-\s*AUTOPAY/.exec(description) ||
			/-\s*PAYMENT/.exec(description) ||
			/(Withdrawal|Deposit)\s*(Xfer|Transfer).*\*/.exec(description) ||
			/(Withdrawal|Deposit):\s*(Xfer|Transfer).*\*/.exec(description)
		);
	};

	public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
		obj,
		validationErrors,
	): obj is StatementRow =>
		validateIsStatementRow(obj, statementRowSchema, validationErrors);
}

export const trimBoilerplateFromDescription = (originalDescription: string) => {
	let description = originalDescription;

	description = description.replace(/\s*POS Transaction\s*/i, " ");
	description = description.replace(/\s*ACH Debit\s*/i, " ");

	return description.trim();
};

export { FtfcuDataProvider as FirstTechFederalDataProvider };
