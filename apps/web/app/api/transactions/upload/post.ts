import { BadRequest, Ok } from "@ekumlin/typescript-toolkit/http";
import { possibleNumberToNumber } from "@ekumlin/typescript-toolkit/number";
import { isString } from "@ekumlin/typescript-toolkit/types";
import { postTransactionRequestSchema } from "@tally/data-models/contracts/api/postTransaction";
import { type PostTransactionsUploadResponse } from "@tally/data-models/contracts/api/postTransactionsUpload";
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
import { type NextResponseFn } from "../../types";

const assetsClient = new AssetsClient();
const subcategoriesClient = new SubcategoriesClient();
const txnsClient = new TxnsClient();
const txnRulesClient = new TxnRulesClient();

export const PostTransactionsUploadRouteAsync: NextResponseFn =
	createApiHandler({
		eventName: "POST:TRANSACTIONS/UPLOAD",
		handler: async (_, request) => {
			const formData = await request.formData();
			const file = formData.get("file");

			if (!(file instanceof File)) {
				return {
					error: "invalidFile",
					ok: false,
					statusCode: BadRequest,
				};
			}

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

			const rawAccountId = formData.get("accountId");
			const accountId =
				isString(rawAccountId) && possibleNumberToNumber(rawAccountId);
			const account = accounts.find((a) => a.id === accountId);

			if (!account?.provider) {
				return {
					error: "invalidAccount",
					ok: false,
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

				return {
					error: "invalidFile",
					ok: false,
					statusCode: BadRequest,
				};
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

			const isValidationOnly =
				formData.get("isValidationOnly") === "true";

			if (!isValidationOnly) {
				await txnsClient.insertTransactionsAsync(rowsProcessed);
			}

			const data: PostTransactionsUploadResponse = {
				rowsFailed,
				rowsIgnored,
				rowsProcessed,
			};

			return {
				data,
				ok: true,
				statusCode: Ok,
			};
		},
		schemata: {
			body: postTransactionRequestSchema,
			params: z.unknown(),
			query: z.unknown(),
		},
	});
