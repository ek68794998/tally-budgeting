import {
	BadRequest,
	CacheControl,
	InternalServerError,
	Ok,
} from "@ekumlin/typescript-toolkit/http";
import {
	type GetTransactionsResponse,
	getTransactionsParamsSchema,
} from "@tally/data-models/contracts/api/getTransactions";
import {
	type PostTransactionResponse,
	postTransactionRequestSchema,
} from "@tally/data-models/contracts/api/postTransaction";
import { searchParamsToObject } from "@tally/utilities/object/searchParamsToObject";
import { NextResponse } from "next/server";
import { TxnsClient } from "../../storage/txnsClient";
import { type NextResponseFn } from "../types";

const txnsClient = new TxnsClient();

const GetAsync: NextResponseFn = async (request) => {
	try {
		const { searchParams } = new URL(request.url);

		const searchParamsObject = searchParamsToObject(searchParams);
		const parsedParams =
			getTransactionsParamsSchema.safeParse(searchParamsObject);

		if (!parsedParams.success) {
			return NextResponse.json(
				{
					error: "Invalid query parameters",
					success: false,
				},
				{
					status: BadRequest,
				},
			);
		}

		const { data: transactions, totalCount } =
			await txnsClient.getTransactionsAsync({
				collectionParams: parsedParams.data,
			});

		const nextLinkUrl = new URL(request.url);
		nextLinkUrl.searchParams.set(
			"page",
			String(parsedParams.data.page + 1),
		);
		nextLinkUrl.searchParams.set("limit", String(parsedParams.data.limit));
		const nextLink = nextLinkUrl.toString();

		const response: GetTransactionsResponse = {
			count: totalCount,
			nextLink,
			transactions,
		};

		return NextResponse.json(response, {
			headers: {
				[CacheControl]: "no-cache, no-store, must-revalidate",
			},
			status: Ok,
		});
	} catch (error) {
		console.error("Failed to fetch transactions:", error);

		return NextResponse.json(
			{
				error: "Failed to fetch transactions",
				success: false,
			},
			{
				status: InternalServerError,
			},
		);
	}
};

const PostAsync: NextResponseFn = async (request) => {
	try {
		const requestJson: unknown = await request.json();
		const body = postTransactionRequestSchema.parse(requestJson);

		await (body.transaction.id >= 0
			? txnsClient.updateTransactionAsync(body.transaction)
			: txnsClient.insertTransactionsAsync([body.transaction]));

		const response: PostTransactionResponse = {
			success: true,
		};

		return NextResponse.json(response, {
			headers: {
				[CacheControl]: "no-cache, no-store, must-revalidate",
			},
			status: Ok,
		});
	} catch (error) {
		console.error("Failed to post transactions:", error);

		return NextResponse.json(
			{
				error: "Failed to post transactions",
				success: false,
			},
			{
				status: InternalServerError,
			},
		);
	}
};

export { GetAsync as GET, PostAsync as POST };
