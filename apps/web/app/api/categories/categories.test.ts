import {
	buildCategory,
	buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../testing/routeTesting";
import { DeleteCategoriesIdRouteAsync } from "./[id]/delete";
import { GetCategoriesRouteAsync } from "./get";
import { PostCategoriesRouteAsync } from "./post";
import { DeleteCategoriesSubIdRouteAsync } from "./sub/[id]/delete";
import { PostCategoriesSubRouteAsync } from "./sub/post";

vi.mock(
	"../../storage/categoriesClient",
	async () =>
		(await import("../testing/routeTesting")).storageModules.categories,
);
vi.mock(
	"../../storage/subcategoriesClient",
	async () =>
		(await import("../testing/routeTesting")).storageModules.subcategories,
);
vi.mock(
	"../../auth/verifyRequest",
	async () =>
		(await import("../testing/routeTesting")).authenticatedRequestModule,
);
vi.mock(
	"../../telemetry/telemetry",
	async () => (await import("../testing/routeTesting")).silentTelemetryModule,
);

const { categories, subcategories } = storageMocks;

describe("categories routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("GET returns categories with their subcategories", async () => {
		categories.getCategoriesAsync.mockResolvedValue([buildCategory()]);
		subcategories.getSubcategoriesAsync.mockResolvedValue([
			buildSubcategory(),
		]);

		const { json, status } = await callRouteAsync(GetCategoriesRouteAsync);

		expect(status).toBe(200);
		expect(json).toEqual({
			categories: [buildCategory()],
			subcategories: [buildSubcategory()],
			success: true,
		});
	});

	it.each([
		{
			body: { category: buildCategory({ id: 0 }) },
			expected: [buildCategory({ id: 0 })],
			method: categories.insertCategoriesAsync,
			route: PostCategoriesRouteAsync,
		},
		{
			body: { category: buildCategory({ id: 3 }) },
			expected: buildCategory({ id: 3 }),
			method: categories.updateCategoryAsync,
			route: PostCategoriesRouteAsync,
		},
		{
			body: { subcategory: buildSubcategory({ id: 0 }) },
			expected: [buildSubcategory({ id: 0 })],
			method: subcategories.insertSubcategoriesAsync,
			route: PostCategoriesSubRouteAsync,
		},
		{
			body: { subcategory: buildSubcategory({ id: 3 }) },
			expected: buildSubcategory({ id: 3 }),
			method: subcategories.updateSubcategoryAsync,
			route: PostCategoriesSubRouteAsync,
		},
	])("POST saves $body", async ({ body, expected, method, route }) => {
		const { status } = await callRouteAsync(route, {
			body,
			method: "POST",
		});

		expect(status).toBe(200);
		expect(method).toHaveBeenCalledExactlyOnceWith(expected);
	});

	it.each([
		{
			method: categories.deleteCategoryAsync,
			route: DeleteCategoriesIdRouteAsync,
		},
		{
			method: subcategories.deleteSubcategoryAsync,
			route: DeleteCategoriesSubIdRouteAsync,
		},
	])("DELETE removes by route id", async ({ method, route }) => {
		const { status } = await callRouteAsync(route, {
			method: "DELETE",
			params: { id: "12" },
		});

		expect(status).toBe(204);
		expect(method).toHaveBeenCalledWith(12);
	});
});
