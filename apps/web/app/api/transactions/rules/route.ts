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
import { Lazy } from "@tally/utilities/lazy/lazy";
import { NextResponse } from "next/server";
import { TxnRulesClient } from "../../../storage/txnRulesClient";
import { type NextResponseFn } from "../../types";

const txnRulesClientLazy = new Lazy(() => new TxnRulesClient());

const GetAsync: NextResponseFn = async (_request) => {
	try {
		const txnRulesClient = txnRulesClientLazy.get();
		const transactionRules =
			await txnRulesClient.getTransactionRulesAsync();

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
		const txnRulesClient = txnRulesClientLazy.get();

		const requestJson: unknown = await request.json();
		const body = postTransactionRuleRequestSchema.parse(requestJson);

		await (body.rule.id >= 0
			? txnRulesClient.updateTransactionRuleAsync(body.rule)
			: txnRulesClient.insertTransactionRulesAsync([body.rule]));

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
