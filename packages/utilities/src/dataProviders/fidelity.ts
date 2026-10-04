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

export const SourceName = "fidelity" as const;

const transactionRowSchema = z.object({
  /* eslint-disable @typescript-eslint/naming-convention */
  "Accrued Interest ($)": z.string(),
  Action: z.string().min(1),
  "Amount ($)": z.string(),
  "Commission ($)": z.string(),
  Description: z.string(),
  "Fees ($)": z.string(),
  "Price ($)": z.string(),
  Quantity: z.string(),
  "Run Date": z.string(),
  "Settlement Date": z.string(),
  Symbol: z.string(),
  Type: z.string(),
  /* eslint-enable @typescript-eslint/naming-convention */
});

type TransactionRow = z.infer<typeof transactionRowSchema>;

const retirementContributionRowBaseSchema = z.object({
  /* eslint-disable @typescript-eslint/naming-convention */
  Date: z.string(),
  Investment: z.string().min(1),
  "Shares/Unit": z.string(),
  "Transaction Type": z.string(),
  /* eslint-enable @typescript-eslint/naming-convention */
});

const retirementContributionRowSchema = z.union([
  /* eslint-disable @typescript-eslint/naming-convention */
  retirementContributionRowBaseSchema.extend({ "Amount ($)": z.string() }),
  retirementContributionRowBaseSchema.extend({ Amount: z.string() }),
  /* eslint-enable @typescript-eslint/naming-convention */
]);

export type RetirementContributionRow = z.infer<
  typeof retirementContributionRowSchema
>;

const isRetirementContributionRow = (
  obj: unknown,
): obj is RetirementContributionRow =>
  retirementContributionRowSchema.safeParse(obj).success;

export type StatementRow = RetirementContributionRow | TransactionRow;

export class FidelityDataProvider implements DataProvider<StatementRow> {
  public convertStatementRowToTransaction: CsvRowToTransactionFn<StatementRow> =
    (inputRow, accountName, customizations) => {
      const { accounts, subcategories } = customizations;

      let rawDate: string;
      let description: string;

      if (isRetirementContributionRow(inputRow)) {
        rawDate = inputRow.Date;
        description = trimBoilerplateFromDescription(inputRow.Investment);
      } else {
        rawDate = inputRow["Run Date"];
        description = trimBoilerplateFromDescription(inputRow.Action);
      }

      const { merchant, subcategoryId } = parseDescription(
        description,
        customizations,
      );

      const account = accounts.find(
        (a) => a.name === accountName && a.provider === "fidelity",
      );
      invariant(
        account,
        `Account with name '${accountName}' not found or does not match provider.`,
      );

      const subcategory =
        subcategories.find((s) => s.id === subcategoryId) ?? DefaultSubcategory;

      const amount = Dollars.toCents(
        "Amount" in inputRow ? inputRow.Amount : inputRow["Amount ($)"],
      );

      return {
        accountId: account.id,
        amountCents: Math.abs(amount),
        categoryId: subcategory.categoryId,
        date: new Date(rawDate).toISOString(),
        merchant,
        subcategoryId: subcategory.id,
        type: amount >= 0 ? "credit" : "debit",
      };
    };

  public isStatementRowIgnored = (inputRow: StatementRow) => {
    if (isRetirementContributionRow(inputRow)) {
      return !["Contributions", "Interest"].includes(
        inputRow["Transaction Type"],
      );
    }

    const { Action: description } = inputRow;

    return !(
      /^BILL\s*PAYMENT/.exec(description) ||
      /\bDIVIDEND\b/.exec(description) ||
      /\bINTEREST\b/.exec(description) ||
      /\bDEBIT\b/.exec(description) ||
      /^(CO|PARTIC)\s*CONTR/.exec(description)
    );
  };

  public validateIsStatementRow: ValidationErrorFn<StatementRow> = (
    obj,
    validationErrors,
  ): obj is StatementRow => {
    const errors1: string[] = [];
    const errors2: string[] = [];

    if (validateIsStatementRow(obj, transactionRowSchema, errors1)) {
      return true;
    }

    if (validateIsStatementRow(obj, retirementContributionRowSchema, errors2)) {
      return true;
    }

    if (errors1.length) {
      validationErrors.push(...errors1);
    } else if (errors2.length) {
      validationErrors.push(...errors2);
    }

    return false;
  };
}

const trimBoilerplateFromDescription = (originalDescription: string) => {
  let description = originalDescription;

  description = description.replace(
    /\s*(BILL\s*PAYMENT|DEBIT\s*CARD\s*PURCHASE)\s*/i,
    " ",
  );

  return description.trim();
};
