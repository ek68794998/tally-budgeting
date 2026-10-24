import z from "zod";
import { happinessLevelSchema } from "../contracts/happinessLevel";
import { transactionDirectionSchema } from "../contracts/transactionDirection";

export const transactionSortFields = [
  "account",
  "amount",
  "category",
  "date",
  "merchant",
] as const satisfies string[];

export const txnRowSchema = z.object({
  account: z.int().nullable(),
  amount_cents: z.string() /* BIGINT -> string */, // eslint-disable-line @typescript-eslint/naming-convention
  date: z.date(),
  direction: transactionDirectionSchema,
  happiness: happinessLevelSchema,
  id: z.int(),
  merchant: z.string().min(1).max(100),
  notes: z.string().nullable(),
  one_time: z.boolean(), // eslint-disable-line @typescript-eslint/naming-convention
  subcategory: z.int(),
});

export type TxnRow = z.infer<typeof txnRowSchema>;
