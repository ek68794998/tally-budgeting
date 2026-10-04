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
  "Contribution Year": z.string(),
  Dollars: z.string(),
  "Funding Source": z.string(),
  "Settlement Date": z.string(),
  "Trade Date": z.string(),
  "Transaction Type": z.string().min(1),
  /* eslint-enable @typescript-eslint/naming-convention */
});

type StatementRow = z.infer<typeof statementRowSchema>;

export class VestwellDataProvider implements DataProvider<StatementRow> {
  public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
    (inputRow, accountName, customizations) => {
      const { accounts, subcategories } = customizations;

      const description = trimBoilerplateFromDescription(
        inputRow["Transaction Type"],
      );
      const { merchant, subcategoryId } = parseDescription(
        description,
        customizations,
      );

      const account = accounts.find(
        (a) => a.name === accountName && a.provider === "vestwell",
      );
      invariant(
        account,
        `Account with name '${accountName}' not found or does not match provider.`,
      );

      const subcategory =
        subcategories.find((s) => s.id === subcategoryId) ?? DefaultSubcategory;

      const amountDollarsString = inputRow.Dollars.replace(/[$,]/g, "");
      const amountCents = Dollars.toCents(amountDollarsString);

      return {
        accountId: account.id,
        amountCents: Math.abs(amountCents),
        categoryId: subcategory.categoryId,
        date: new Date(inputRow["Settlement Date"]).toISOString(),
        merchant,
        subcategoryId: subcategory.id,
        type: amountCents < 0 ? "debit" : "credit",
      };
    };

  public isStatementRowIgnored = (_inputRow: StatementRow) => false;

  public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
    obj,
    validationErrors,
  ): obj is StatementRow =>
    validateIsStatementRow(obj, statementRowSchema, validationErrors);
}

const trimBoilerplateFromDescription = (originalDescription: string) =>
  originalDescription.trim();
