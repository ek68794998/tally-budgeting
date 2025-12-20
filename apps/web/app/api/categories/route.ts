import {
	CacheControl,
	InternalServerError,
	Ok,
} from "@ekumlin/typescript-toolkit/http";
import { type GetCategoriesResponse } from "@tally/data-models/contracts/api/getCategories";
import { NextResponse } from "next/server";
import { CategoriesClient } from "../../storage/categoriesClient";
import { SubcategoriesClient } from "../../storage/subcategoriesClient";
import { type NextResponseFn } from "../types";

const categoriesClient = new CategoriesClient();
const subcategoriesClient = new SubcategoriesClient();

const GetAsync: NextResponseFn = async (_request) => {
	try {
		const categories = await categoriesClient.getCategoriesAsync();
		const subcategories = await subcategoriesClient.getSubcategoriesAsync();

		const response: GetCategoriesResponse = {
			categories,
			subcategories,
		};

		return NextResponse.json(response, {
			headers: {
				[CacheControl]: "no-cache, no-store, must-revalidate",
			},
			status: Ok,
		});
	} catch (error) {
		console.error("Failed to fetch categories:", error);

		return NextResponse.json(
			{
				error: "Failed to fetch categories",
				success: false,
			},
			{
				status: InternalServerError,
			},
		);
	}
};

export { GetAsync as GET };
