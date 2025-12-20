import {
	Accepted,
	CacheControl,
	InternalServerError,
	Ok,
} from "@ekumlin/typescript-toolkit/http";
import { type GetTransactionRulesResponse } from "@tally/data-models/contracts/api/getTransactionRules";
import {
	type PostTransactionRuleResponse,
	postTransactionRuleRequestSchema,
} from "@tally/data-models/contracts/api/postTransactionRule";
import { NextResponse } from "next/server";
import { TransactionRulesClient } from "../../../storage/transactionRulesClient";
import { type NextResponseFn } from "../../types";

const transactionRulesClient = new TransactionRulesClient();

const GetAsync: NextResponseFn = async (_request) => {
	try {
		const transactionRules =
			await transactionRulesClient.getTransactionRulesAsync();

		const response: GetTransactionRulesResponse = {
			transactionRules,
		};

		return NextResponse.json(response, {
			headers: {
				[CacheControl]: "no-cache, no-store, must-revalidate",
			},
			status: Ok,
		});
	} catch (error) {
		console.error("Failed to fetch transactionRules:", error);

		return NextResponse.json(
			{
				error: "Failed to fetch transactionRules",
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
		const body = postTransactionRuleRequestSchema.parse(requestJson);

		if (body.rule.id >= 0) {
			await transactionRulesClient.updateTransactionRuleAsync(body.rule);
		} else {
			await transactionRulesClient.insertTransactionRulesAsync([
				body.rule,
			]);
		}

		const response: PostTransactionRuleResponse = {
			success: true,
		};

		return NextResponse.json(response, {
			headers: {
				[CacheControl]: "no-cache, no-store, must-revalidate",
			},
			status: Accepted,
		});
	} catch (error) {
		console.error("Failed to post transactionRules:", error);

		return NextResponse.json(
			{
				error: "Failed to post transactionRules",
				success: false,
			},
			{
				status: InternalServerError,
			},
		);
	}
};

export { GetAsync as GET, PostAsync as POST };
