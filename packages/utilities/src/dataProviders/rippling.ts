import { invariant } from "@ekumlin/typescript-toolkit/values";
import { DefaultSubcategory } from "@tally/data-models/contracts/subcategory";
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
  "Attempted Amount": z.string(),
  Balance: z.string(),
  Description: z.string().min(1),
  "Final Transaction": z.string().min(1),
  Merchant: z.string(),
  Status: z.string(),
  "Transaction date": z.string().min(1),
  "Transaction settlement date": z.string(),
  "Transaction type": z.string(),
  /* eslint-enable @typescript-eslint/naming-convention */
});

type StatementRow = z.infer<typeof statementRowSchema>;

const withdrawalTransactionTypes: string[] = ["Card Swipe"] as const;

export class RipplingDataProvider implements DataProvider<StatementRow> {
  public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
    (inputRow, accountName, customizations) => {
      const { accounts, subcategories } = customizations;

      const description = (inputRow.Merchant || inputRow.Description).trim();
      const { merchant, subcategoryId } = parseDescription(
        description,
        customizations,
      );

      const account = accounts.find(
        (a) => a.name === accountName && a.provider === "rippling",
      );
      invariant(
        account,
        `Account with name '${accountName}' not found or does not match provider.`,
      );

      const subcategory =
        subcategories.find((s) => s.id === subcategoryId) ?? DefaultSubcategory;

      const amountCents = Dollars.toCents(
        inputRow["Final Transaction"].replace(/[$,]/g, ""),
      );

      return {
        accountId: account.id,
        amountCents: Math.abs(amountCents),
        categoryId: subcategory.categoryId,
        date: new Date(inputRow["Transaction date"]).toISOString(),
        merchant,
        subcategoryId: subcategory.id,
        type: withdrawalTransactionTypes.includes(description)
          ? "credit"
          : "debit",
      };
    };

  public isStatementRowIgnored = (inputRow: StatementRow) => {
    const { Description: description } = inputRow;

    return !!/^Investment$/.exec(description);
  };

  public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
    obj,
    validationErrors,
  ): obj is StatementRow =>
    validateIsStatementRow(obj, statementRowSchema, validationErrors);
}
