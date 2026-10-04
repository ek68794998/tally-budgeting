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
  Employer: z.string(),
  "Fulfilled date": z.string(),
  "Pre-tax": z.string(),
  "Requested date": z.string(),
  Roth: z.string(),
  Total: z.string(),
  "Transaction Id": z.string(),
  "Transaction type": z.string().min(1),
  /* eslint-enable @typescript-eslint/naming-convention */
});

type StatementRow = z.infer<typeof statementRowSchema>;

export class GuidelineDataProvider implements DataProvider<StatementRow> {
  public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
    (inputRow, accountName, customizations) => {
      const { accounts, subcategories } = customizations;

      const description = trimBoilerplateFromDescription(
        inputRow["Transaction type"],
      );
      const { merchant, subcategoryId } = parseDescription(
        description,
        customizations,
      );

      const account = accounts.find(
        (a) => a.name === accountName && a.provider === "guideline",
      );
      invariant(
        account,
        `Account with name '${accountName}' not found or does not match provider.`,
      );

      const subcategory =
        subcategories.find((s) => s.id === subcategoryId) ?? DefaultSubcategory;

      return {
        accountId: account.id,
        amountCents: Math.abs(Dollars.toCents(inputRow.Total)),
        categoryId: subcategory.categoryId,
        date: new Date(inputRow["Fulfilled date"]).toISOString(),
        merchant,
        subcategoryId: subcategory.id,
        type: description.includes("Fee") ? "debit" : "credit",
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
