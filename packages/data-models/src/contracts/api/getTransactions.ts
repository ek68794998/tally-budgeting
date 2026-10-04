import z from "zod";
import { transactionSortFields } from "../../database/txnRow";
import { transactionSchema } from "../transaction";
import { withNextLinkSchema } from "../types";
import {
  createApiResponseSchema,
  createFilterParamsSchema,
  createPaginationParamsSchema,
  createSortParamsSchema,
} from "./types";

export const MaxTransactionsPerPage = 100;

export const getTransactionsParamsSchema = z.object({
  ...createFilterParamsSchema().shape,
  ...createPaginationParamsSchema(MaxTransactionsPerPage).shape,
  ...createSortParamsSchema(transactionSortFields).shape,
});

export type GetTransactionsParams = z.infer<typeof getTransactionsParamsSchema>;

export const getTransactionsResponseSchema = createApiResponseSchema({
  ...withNextLinkSchema.shape,
  count: z.number().min(0),
  transactions: z.array(transactionSchema),
});

export type GetTransactionsResponse = z.infer<
  typeof getTransactionsResponseSchema
>;
