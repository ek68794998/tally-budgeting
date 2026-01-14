import { BadRequest, Ok } from "@ekumlin/typescript-toolkit/http";
import { possibleNumberToNumber } from "@ekumlin/typescript-toolkit/number";
import { isString } from "@ekumlin/typescript-toolkit/types";
import { type PostTransactionsUploadResponse } from "@tally/data-models/contracts/api/postTransactionsUpload";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { isAccount } from "@tally/data-models/data/accountHelpers";
import { getCsvRows, processCsvFile } from "@tally/utilities/dataHandlers/csv";
import { type Merchant } from "@tally/utilities/dataHandlers/types";
import { parseRowAsTransaction } from "@tally/utilities/dataProviders/parser";
import { NextResponse } from "next/server";
import { AssetsClient } from "../../../storage/assetsClient";
import { SubcategoriesClient } from "../../../storage/subcategoriesClient";
import { TxnRulesClient } from "../../../storage/txnRulesClient";
import { TxnsClient } from "../../../storage/txnsClient";
import { type NextResponseFn } from "../../types";

const assetsClient = new AssetsClient();
const subcategoriesClient = new SubcategoriesClient();
const txnsClient = new TxnsClient();
const txnRulesClient = new TxnRulesClient();

const PostAsync: NextResponseFn = async (request) => {
	const formData = await request.formData();
	const file = formData.get("file");

	if (!(file instanceof File)) {
		return NextResponse.json(
			{ errorCode: "invalidFile" },
			{ status: BadRequest },
		);
	}

	const assets = await assetsClient.getAssetsAsync();
	const accounts = assets.filter(isAccount);
	const subcategories = await subcategoriesClient.getSubcategoriesAsync();
	const transactionRules = await txnRulesClient.getTransactionRulesAsync();

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
		return NextResponse.json(
			{ errorCode: "invalidAccount" },
			{ status: BadRequest },
		);
	}

	let csvFileRows: unknown[];

	try {
		const fileContent = await file.text();
		const csvFileContent = processCsvFile(fileContent);
		csvFileRows = getCsvRows(csvFileContent);
	} catch (error) {
		console.error(error);

		return NextResponse.json(
			{ errorCode: "invalidFile" },
			{ status: BadRequest },
		);
	}

	const rowsFailed: [string, unknown][] = [];
	const rowsIgnored: unknown[] = [];
	const rowsProcessed: Transaction[] = [];

	for (const row of csvFileRows) {
		const transactionParseResult = parseRowAsTransaction(row, account, {
			accounts,
			merchants,
			subcategories,
		});

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

	const isValidationOnly = formData.get("isValidationOnly") === "true";

	if (!isValidationOnly) {
		await txnsClient.insertTransactionsAsync(rowsProcessed);
	}

	const responseData: PostTransactionsUploadResponse = {
		rowsFailed,
		rowsIgnored,
		rowsProcessed,
	};

	return NextResponse.json(responseData, { status: Ok });
};

export { PostAsync as POST };
