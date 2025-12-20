import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
import { transactionDirectionSchema } from "@tally/data-models/contracts/transactionDirection";
import { z } from "zod";
import { parseDescription } from "../dataHandlers/parseDescription";
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
	Description: z.string(),
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

const isStatementRow = (obj: unknown): obj is StatementRow =>
	statementRowSchema.safeParse(obj).success;

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

			return {
				accountId: account.id,
				amount: Math.abs(
					Math.round(Number.parseFloat(inputRow.Amount) * 100) / 100,
				),
				categoryId: subcategory.categoryId,
				date: new Date(inputRow["Posting Date"]).toISOString(),
				id: -1,
				merchant,
				subcategoryId: subcategory.id,
				type: transactionDirectionSchema.parse(
					inputRow["Transaction Type"].toLowerCase(),
				),
			};
		};

	public isStatementRowIgnored = (inputRow: StatementRow) => {
		const { Description: description } = inputRow;

		return !!(
			/-\s*AUTOPAY/.exec(description) ||
			/-\s*PAYMENT/.exec(description) ||
			/(Withdrawal|Deposit)\s*Transfer/.exec(description)
		);
	};

	public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
		obj,
		validationErrors,
	): obj is StatementRow => {
		validationErrors.length = 0;

		if (isStatementRow(obj)) {
			const { Description: description } = obj;

			if (!description) {
				validationErrors.push("No description found.");
			}

			return validationErrors.length === 0;
		} else {
			validationErrors.push("Data shape does not match expected type.");
		}

		return false;
	};
}

export const trimBoilerplateFromDescription = (originalDescription: string) => {
	let description = originalDescription;

	description = description.replace(/\s*POS Transaction\s*/i, " ");
	description = description.replace(/\s*ACH Debit\s*/i, " ");

	return description.trim();
};

export { FtfcuDataProvider as FirstTechFederalDataProvider };
