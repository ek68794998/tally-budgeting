import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
import { DateTime } from "luxon";
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
	Balance: z.string(),
	Cardholder: z.string(),
	Date: z.string(),
	Description: z.string(),
	Merchant: z.string(),
	Points: z.string(),
	Status: z.string(),
	Time: z.string(),
	Type: z.string(),
	/* eslint-enable @typescript-eslint/naming-convention */
});

type StatementRow = z.infer<typeof statementRowSchema>;

const isStatementRow = (obj: unknown): obj is StatementRow =>
	statementRowSchema.safeParse(obj).success;

export class RobinhoodDataProvider implements DataProvider<StatementRow> {
	public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
		(inputRow, accountName, customizations) => {
			const { accounts, subcategories } = customizations;

			const description = trimBoilerplateFromDescription(
				inputRow.Merchant,
			);
			const { merchant, subcategoryId } = parseDescription(
				description,
				customizations,
			);

			const account = accounts.find(
				(a) => a.name === accountName && a.provider === "robinhood",
			);
			invariant(
				account,
				`Account with name '${accountName}' not found or does not match provider.`,
			);

			const subcategory =
				subcategories.find((s) => s.id === subcategoryId) ??
				DefaultSubcategory;

			const inputRowDate = DateTime.fromFormat(
				`${inputRow.Date} ${inputRow.Time}`,
				"yyyy-MM-dd h:mm a",
			);

			const transactionDate = inputRowDate.isValid
				? inputRowDate
				: DateTime.now();

			return {
				accountId: account.id,
				amountCents: Math.abs(Dollars.toCents(inputRow.Amount)),
				categoryId: subcategory.categoryId,
				date: transactionDate.toISO(),
				merchant,
				subcategoryId: subcategory.id,
				type: inputRow.Type === "Purchase" ? "debit" : "credit",
			};
		};

	public isStatementRowIgnored = (_inputRow: StatementRow) => false; // TODO: Ignore Status=="Pending"?

	public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
		obj,
		validationErrors,
	): obj is StatementRow => {
		validationErrors.length = 0;

		if (isStatementRow(obj)) {
			const { Merchant: description } = obj;

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

export const trimBoilerplateFromDescription = (originalDescription: string) =>
	originalDescription.trim();
