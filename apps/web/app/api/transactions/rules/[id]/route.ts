import {
	Accepted,
	CacheControl,
	InternalServerError,
} from "@ekumlin/typescript-toolkit/http";
import { invariant } from "@ekumlin/typescript-toolkit/values";
import { deleteTransactionRuleQuerySchema } from "@tally/data-models/contracts/api/deleteTransactionRule";
import { NextResponse } from "next/server";
import { TransactionRulesClient } from "../../../../storage/transactionRulesClient";
import { type NextResponseFn } from "../../../types";

const transactionRulesClient = new TransactionRulesClient();

const DeleteAsync: NextResponseFn = async (_request, context) => {
	invariant(context.params, "Params object must be defined");

	try {
		const { id } = deleteTransactionRuleQuerySchema.parse(
			await context.params,
		);

		const idNumber = parseInt(id, 10);
		await transactionRulesClient.deleteTransactionRuleAsync(idNumber);

		return NextResponse.json(null, {
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

export { DeleteAsync as DELETE };
