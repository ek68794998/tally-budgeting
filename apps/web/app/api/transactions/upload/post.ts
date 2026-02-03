import { BadRequest, Ok } from "@ekumlin/typescript-toolkit/http";
import { possibleNumberToNumber } from "@ekumlin/typescript-toolkit/number";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { postTransactionRequestSchema } from "@tally/data-models/contracts/api/postTransaction";
import {
	type PostTransactionsUploadResponse,
	postTransactionsUploadRequestSchema,
} from "@tally/data-models/contracts/api/postTransactionsUpload";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { isAccount } from "@tally/data-models/data/accountHelpers";
import { getCsvRows, processCsvFile } from "@tally/utilities/dataHandlers/csv";
import { type Merchant } from "@tally/utilities/dataHandlers/types";
import { parseRowAsTransaction } from "@tally/utilities/dataProviders/parser";
import z from "zod";
import { AssetsClient } from "../../../storage/assetsClient";
import { SubcategoriesClient } from "../../../storage/subcategoriesClient";
import { TxnRulesClient } from "../../../storage/txnRulesClient";
import { TxnsClient } from "../../../storage/txnsClient";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
import { type ApiResult } from "../../handlers/types";
import { type NextResponseFn } from "../../types";

const assetsClientLazy = new Lazy(() => new AssetsClient());
const subcategoriesClientLazy = new Lazy(() => new SubcategoriesClient());
const txnsClientLazy = new Lazy(() => new TxnsClient());
const txnRulesClientLazy = new Lazy(() => new TxnRulesClient());

export const PostTransactionsUploadRouteAsync: NextResponseFn =
	createApiHandler({
		bodyParser: async (request) => {
			const formData = await request.formData();

			return postTransactionRequestSchema.parse({
				accountId: formData.get("accountId"),
				file: formData.get("file"),
				isValidationOnly: formData.get("isValidationOnly"),
			});
		},
		eventName: "POST:TRANSACTIONS/UPLOAD",
		handler: async ({
			body,
		}): Promise<ApiResult<PostTransactionsUploadResponse>> => {
			const accountId = possibleNumberToNumber(body.accountId) ?? 0;
			const file = body.file;
			const isValidationOnly = body.isValidationOnly === "true";

			const assetsClient = assetsClientLazy.get();
			const subcategoriesClient = subcategoriesClientLazy.get();
			const txnsClient = txnsClientLazy.get();
			const txnRulesClient = txnRulesClientLazy.get();

			const assets = await assetsClient.getAssetsAsync();
			const accounts = assets.filter(isAccount);
			const subcategories =
				await subcategoriesClient.getSubcategoriesAsync();
			const transactionRules =
				await txnRulesClient.getTransactionRulesAsync();

			const merchants = transactionRules.map(
				({
					matcher: { flags, pattern },
					merchantName,
					subcategoryId,
				}): Merchant => ({
					categoryId: subcategoryId,
					friendlyName: merchantName,
					matcherRegex: new RegExp(pattern, flags),
				}),
			);

			const account = accounts.find((a) => a.id === accountId);

			if (!account?.provider) {
				return {
					error: { code: "invalidAccount" },
					statusCode: BadRequest,
				};
			}

			let csvFileRows: unknown[];

			try {
				const fileContent = await file.text();
				const csvFileContent = processCsvFile(fileContent);
				csvFileRows = getCsvRows(csvFileContent);
			} catch (error) {
				console.error(error);

				throw new HttpError(
					"Invalid file upload",
					BadRequest,
					"invalidFileUpload",
				);
			}

			const rowsFailed: [string, unknown][] = [];
			const rowsIgnored: unknown[] = [];
			const rowsProcessed: Transaction[] = [];

			for (const row of csvFileRows) {
				const transactionParseResult = parseRowAsTransaction(
					row,
					account,
					{
						accounts,
						merchants,
						subcategories,
					},
				);

				if (transactionParseResult.result === "ignore") {
					rowsIgnored.push(row);
					continue;
				}

				if (transactionParseResult.result === "failure") {
					for (const validationError of transactionParseResult.errors) {
						rowsFailed.push([validationError, row]);
					}

					continue;
				}

				rowsProcessed.push(transactionParseResult.transaction);
			}

			if (!isValidationOnly) {
				await txnsClient.insertTransactionsAsync(rowsProcessed);
			}

			return {
				data: {
					rowsFailed,
					rowsIgnored,
					rowsProcessed,
				},
				statusCode: Ok,
			};
		},
		schemata: {
			body: postTransactionsUploadRequestSchema,
			params: z.unknown(),
			query: z.unknown(),
		},
	});
