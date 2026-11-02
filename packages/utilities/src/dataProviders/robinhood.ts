import { invariant, unreachable } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
import { type TransactionDirection } from "@tally/data-models/contracts/transactionDirection";
import { DateTime, type DateTimeMaybeValid } from "luxon";
import { z } from "zod";
import { parseDescription } from "../dataHandlers/parseDescription";
import { Dollars } from "../financial/dollars";
import { validateIsStatementRow } from "./helpers";
import {
  type CsvRowToTransactionFn,
  type DataProvider,
  type ValidationErrorFn,
} from "./types";

const goldBankingStatementRowSchema = z.object({
  /* eslint-disable @typescript-eslint/naming-convention */
  Amount: z.string(),
  Date: z.string(),
  Description: z.string(),
  /* eslint-enable @typescript-eslint/naming-convention */
});

type GoldBankingStatementRow = z.infer<typeof goldBankingStatementRowSchema>;

const goldCardStatementRowSchema = z.object({
  /* eslint-disable @typescript-eslint/naming-convention */
  Amount: z.string(),
  Balance: z.string(),
  Cardholder: z.string(),
  Date: z.string(),
  Description: z.string(),
  Merchant: z.string().min(1),
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
  Description: z.string().min(1),
  Instrument: z.string(),
  Price: z.string(),
  "Process Date": z.string(),
  Quantity: z.string(),
  "Settle Date": z.string(),
  "Trans Code": z.string(),
  /* eslint-enable @typescript-eslint/naming-convention */
});

type InvestmentStatementRow = z.infer<typeof investmentStatementRowSchema>;

type StatementRow =
  | GoldBankingStatementRow
  | GoldCardStatementRow
  | InvestmentStatementRow;
type TypedStatementRow =
  | { row: GoldBankingStatementRow; type: "banking" }
  | { row: GoldCardStatementRow; type: "creditCard" }
  | { row: InvestmentStatementRow; type: "investment" };

export class RobinhoodDataProvider implements DataProvider<StatementRow> {
  private static getTypedInputRow(inputRow: StatementRow): TypedStatementRow {
    const asCreditCard = goldCardStatementRowSchema.safeParse(inputRow);

    if (asCreditCard.success) {
      return { row: asCreditCard.data, type: "creditCard" };
    }

    const asInvestment = investmentStatementRowSchema.safeParse(inputRow);

    if (asInvestment.success) {
      return { row: asInvestment.data, type: "investment" };
    }

    const asBanking = goldBankingStatementRowSchema.safeParse(inputRow);

    if (asBanking.success) {
      return { row: asBanking.data, type: "banking" };
    }

    throw new Error("Invalid input row.");
  }

  public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
    (inputRow, accountName, customizations) => {
      const { accounts, subcategories } = customizations;

      let amountDollarsString: string;
      let description: string;
      let date: DateTimeMaybeValid;
      let type: TransactionDirection;

      const { row: typedInputRow, type: inputRowType } =
        RobinhoodDataProvider.getTypedInputRow(inputRow);

      switch (inputRowType) {
        case "creditCard": {
          amountDollarsString = typedInputRow.Amount;

          description =
            trimBoilerplateFromDescription(typedInputRow.Description) ||
            trimBoilerplateFromDescription(typedInputRow.Merchant);

          date = DateTime.fromFormat(
            `${typedInputRow.Date} ${typedInputRow.Time}`,
            "yyyy-MM-dd h:mm a",
          );

          type = typedInputRow.Type === "Purchase" ? "debit" : "credit";

          break;
        }

        case "banking": {
          amountDollarsString = typedInputRow.Amount;

          description = trimBoilerplateFromDescription(
            typedInputRow.Description,
          );

          date = DateTime.fromISO(`${typedInputRow.Date}T12:00:00Z`);

          type = amountDollarsString.startsWith("-") ? "debit" : "credit";

          break;
        }

        case "investment": {
          amountDollarsString = typedInputRow.Amount.replace(/[$,]/g, "");

          if (amountDollarsString.startsWith("(")) {
            amountDollarsString = amountDollarsString.slice(1, -1);
            type = "debit";
          } else {
            type = "credit";
          }

          description = typedInputRow.Instrument
            ? `(${typedInputRow.Instrument}) ${typedInputRow.Description}`
            : typedInputRow.Description;

          date = DateTime.fromFormat(typedInputRow["Process Date"], "M/d/yyyy");

          break;
        }

        default:
          return unreachable(inputRowType);
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
        subcategories.find((s) => s.id === subcategoryId) ?? DefaultSubcategory;

      const transactionDate = date.isValid ? date : DateTime.now();

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
    const { row: typedInputRow, type: inputRowType } =
      RobinhoodDataProvider.getTypedInputRow(inputRow);

    if (inputRowType === "creditCard") {
      const { Merchant: merchant, Status: status } = typedInputRow;

      return merchant === "Payment" || status !== "Posted";
    }

    if (inputRowType === "investment") {
      const { "Trans Code": transCode } = typedInputRow;

      return (
        transCode === "Buy" ||
        transCode === "Sell" ||
        !!(
          /Dividend\s*Reinvestment/i.exec(typedInputRow.Description) ||
          /balance\s*payment/.exec(typedInputRow.Description)
        )
      );
    }

    // Banking (checking/savings) row.
    const { Description: description } = typedInputRow;

    return !!/Inter-Entity Transfer/i.exec(description);
  };

  public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
    obj,
    validationErrors,
  ): obj is StatementRow => {
    const errors1: string[] = [];
    const errors2: string[] = [];
    const errors3: string[] = [];

    if (validateIsStatementRow(obj, goldCardStatementRowSchema, errors1)) {
      return true;
    }

    if (validateIsStatementRow(obj, goldBankingStatementRowSchema, errors2)) {
      return true;
    }

    if (validateIsStatementRow(obj, investmentStatementRowSchema, errors3)) {
      return true;
    }

    validationErrors.push(...errors1);
    validationErrors.push(...errors2);
    validationErrors.push(...errors3);

    return false;
  };
}

export const trimBoilerplateFromDescription = (originalDescription: string) =>
  originalDescription.trim();
