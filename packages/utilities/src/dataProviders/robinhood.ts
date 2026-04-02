import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
import { type TransactionDirection } from "@tally/data-models/contracts/transactionDirection";
import { DateTime, type DateTimeMaybeValid } from "luxon";
import { z } from "zod";
import { parseDescription } from "../dataHandlers/parseDescription";
import { Dollars } from "../financial/dollars";
import {
	type CsvRowToTransactionFn,
	type DataProvider,
	type ValidationErrorFn,
} from "./types";

const goldCardStatementRowSchema = z.object({
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

type GoldCardStatementRow = z.infer<typeof goldCardStatementRowSchema>;

const investmentStatementRowSchema = z.object({
	/* eslint-disable @typescript-eslint/naming-convention */
	"Activity Date": z.string(),
	Amount: z.string(),
	Description: z.string(),
	Instrument: z.string(),
	Price: z.string(),
	"Process Date": z.string(),
	Quantity: z.string(),
	"Settle Date": z.string(),
	"Trans Code": z.string(),
	/* eslint-enable @typescript-eslint/naming-convention */
});

type InvestmentStatementRow = z.infer<typeof investmentStatementRowSchema>;

type StatementRow = GoldCardStatementRow | InvestmentStatementRow;

const isStatementRow = (obj: unknown): obj is StatementRow =>
	goldCardStatementRowSchema.safeParse(obj).success ||
	investmentStatementRowSchema.safeParse(obj).success;

export class RobinhoodDataProvider implements DataProvider<StatementRow> {
	public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
		(inputRow, accountName, customizations) => {
			const { accounts, subcategories } = customizations;

			let amountDollarsString: string;
			let description: string;
			let inputRowDate: DateTimeMaybeValid;
			let type: TransactionDirection;

			if ("Merchant" in inputRow) {
				// Gold Card statement row

				amountDollarsString = inputRow.Amount;

				description =
					trimBoilerplateFromDescription(inputRow.Description) ||
					trimBoilerplateFromDescription(inputRow.Merchant);

				inputRowDate = DateTime.fromFormat(
					`${inputRow.Date} ${inputRow.Time}`,
					"yyyy-MM-dd h:mm a",
				);

				type = inputRow.Type === "Purchase" ? "debit" : "credit";
			} else {
				// Investment statement row

				amountDollarsString = inputRow.Amount.replace(/[$,]/g, "");

				if (amountDollarsString.startsWith("(")) {
					amountDollarsString = amountDollarsString.slice(1, -1);
					type = "debit";
				} else {
					type = "credit";
				}

				description = inputRow.Instrument
					? `(${inputRow.Instrument}) ${inputRow.Description}`
					: inputRow.Description;

				inputRowDate = DateTime.fromFormat(
					inputRow["Process Date"],
					"M/d/yyyy",
				);

				console.log(
					amountDollarsString,
					"//",
					description,
					"//",
					inputRowDate,
					"//",
					type,
				);
			}

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

			const transactionDate = inputRowDate.isValid
				? inputRowDate
				: DateTime.now();

			return {
				accountId: account.id,
				amountCents: Math.abs(Dollars.toCents(amountDollarsString)),
				categoryId: subcategory.categoryId,
				date: transactionDate.toISO(),
				merchant,
				subcategoryId: subcategory.id,
				type,
			};
		};

	public isStatementRowIgnored = (inputRow: StatementRow) => {
		if ("Merchant" in inputRow) {
			const { Merchant: description, Status: status } = inputRow;

			return description === "Payment" || status !== "Posted";
		} else {
			const { "Trans Code": transCode } = inputRow;

			return (
				transCode === "Buy" ||
				transCode === "Sell" ||
				!!(
					/Dividend\s*Reinvestment/i.exec(inputRow.Description) ||
					/balance\s*payment/.exec(inputRow.Description)
				)
			);
		}
	};

	public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
		obj,
		validationErrors,
	): obj is StatementRow => {
		validationErrors.length = 0;

		if (isStatementRow(obj)) {
			const description =
				"Merchant" in obj ? obj.Merchant : obj.Description;

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
