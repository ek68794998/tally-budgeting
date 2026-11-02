import { isNull } from "@ekumlin/typescript-toolkit/types";
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

// Each schema requires the other schemas' identifying columns to be absent, so a row can only match one.
const absentColumn = z.undefined().optional();

const goldBankingStatementRowSchema = z.object({
  /* eslint-disable @typescript-eslint/naming-convention */
  Amount: z.string(),
  Date: z.string(),
  Description: z.string(),
  Merchant: absentColumn,
  "Trans Code": absentColumn,
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
  "Trans Code": absentColumn,
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
  Merchant: absentColumn,
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

const getTypedInputRow = (inputRow: StatementRow): TypedStatementRow => {
  if (inputRow.Merchant !== undefined) {
    return { row: inputRow, type: "creditCard" };
  }

  if (inputRow["Trans Code"] !== undefined) {
    return { row: inputRow, type: "investment" };
  }

  return { row: inputRow, type: "banking" };
};

const getIntendedStatementRowSchema = (
  obj: unknown,
): z.ZodType<StatementRow> => {
  if (typeof obj === "object" && !isNull(obj)) {
    if ("Merchant" in obj) {
      return goldCardStatementRowSchema;
    }

    if ("Trans Code" in obj) {
      return investmentStatementRowSchema;
    }
  }

  return goldBankingStatementRowSchema;
};

export class RobinhoodDataProvider implements DataProvider<StatementRow> {
  public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
    (inputRow, accountName, customizations) => {
      const { accounts, subcategories } = customizations;

      let amountDollarsString: string;
      let description: string;
      let date: DateTimeMaybeValid;
      let type: TransactionDirection;

      const { row: typedInputRow, type: inputRowType } =
        getTypedInputRow(inputRow);

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
          amountDollarsString = typedInputRow.Amount.replace(/[$,]/g, "");

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
      getTypedInputRow(inputRow);

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
    const statementRowSchemas = [
      goldCardStatementRowSchema,
      goldBankingStatementRowSchema,
      investmentStatementRowSchema,
    ];

    if (statementRowSchemas.some((schema) => schema.safeParse(obj).success)) {
      return true;
    }

    validateIsStatementRow(
      obj,
      getIntendedStatementRowSchema(obj),
      validationErrors,
    );

    return false;
  };
}

export const trimBoilerplateFromDescription = (originalDescription: string) =>
  originalDescription.trim();
