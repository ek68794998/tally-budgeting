import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
import { type TransactionDirection } from "@tally/data-models/contracts/transactionDirection";
import { z } from "zod";
import { parseDescription } from "../dataHandlers/parseDescription";
import { Dollars } from "../financial/dollars";
import {
	type CsvRowToTransactionFn,
	type DataProvider,
	type ValidationErrorFn,
} from "./types";

const statementRowSchema = z.object({
	/* eslint-disable @typescript-eslint/naming-convention */
	Amount: z.string(),
	Category: z.string(),
	Description: z.string(),
	Memo: z.string(),
	"Post Date": z.string(),
	"Transaction Date": z.string(),
	Type: z.string(),
	/* eslint-enable @typescript-eslint/naming-convention */
});

type StatementRow = z.infer<typeof statementRowSchema>;

const isStatementRow = (obj: unknown): obj is StatementRow =>
	statementRowSchema.safeParse(obj).success;

export class ChaseDataProvider implements DataProvider<StatementRow> {
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
				(a) => a.name === accountName && a.provider === "chase",
			);
			invariant(
				account,
				`Account with name '${accountName}' not found or does not match provider.`,
			);

			const subcategory =
				subcategories.find((s) => s.id === subcategoryId) ??
				DefaultSubcategory;

			const rowTransactionType = inputRow.Type.toLowerCase();
			const transactionType: TransactionDirection =
				rowTransactionType === "sale" || rowTransactionType === "debit"
					? "debit"
					: "credit";

			return {
				accountId: account.id,
				amountCents: Math.abs(Dollars.toCents(inputRow.Amount)),
				categoryId: subcategory.categoryId,
				date: new Date(inputRow["Transaction Date"]).toISOString(),
				merchant,
				subcategoryId: subcategory.id,
				type: transactionType,
			};
		};

	public isStatementRowIgnored = (inputRow: StatementRow) => {
		const { Description: description } = inputRow;

		return !!/AUTOMATIC\s*PAYMENT/.exec(description);
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

const trimBoilerplateFromDescription = (originalDescription: string) =>
	originalDescription.trim();
