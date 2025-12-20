import {
	CacheControl,
	InternalServerError,
	Ok,
} from "@ekumlin/typescript-toolkit/http";
import { type GetAssetsResponse } from "@tally/data-models/contracts/api/getAssets";
import { NextResponse } from "next/server";
import { AssetsClient } from "../../storage/assetsClient";
import { type NextResponseFn } from "../types";

const assetsClient = new AssetsClient();

const GetAsync: NextResponseFn = async (_request) => {
	try {
		const assets = await assetsClient.getAssetsAsync();

		const response: GetAssetsResponse = {
			assets,
		};

		return NextResponse.json(response, {
			headers: {
				[CacheControl]: "no-cache, no-store, must-revalidate",
			},
			status: Ok,
		});
	} catch (error) {
		console.error("Failed to fetch assets:", error);

		return NextResponse.json(
			{
				error: "Failed to fetch assets",
				success: false,
			},
			{
				status: InternalServerError,
			},
		);
	}
};

export { GetAsync as GET };
