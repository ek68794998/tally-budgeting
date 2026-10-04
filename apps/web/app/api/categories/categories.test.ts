import { isUndefined } from "@ekumlin/typescript-toolkit/types";
import {
  buildCategory,
  buildSubcategory,
} from "@tally/data-models/testing/fixtures";
import { withoutId } from "@tally/utilities/object/withoutId";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../testing/routeTesting";
import { DeleteCategoriesIdRouteAsync } from "./[id]/delete";
import { PutCategoriesIdRouteAsync } from "./[id]/put";
import { GetCategoriesRouteAsync } from "./get";
import { PostCategoriesRouteAsync } from "./post";
import { DeleteCategoriesSubIdRouteAsync } from "./sub/[id]/delete";
import { PutCategoriesSubIdRouteAsync } from "./sub/[id]/put";
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
    subcategories.getSubcategoriesAsync.mockResolvedValue([buildSubcategory()]);

    const { json, status } = await callRouteAsync(GetCategoriesRouteAsync);

    expect(status).toBe(200);
    expect(json).toEqual({
      categories: [buildCategory()],
      subcategories: [buildSubcategory()],
      success: true,
    });
  });

  const resources = [
    {
      build: buildCategory,
      insert: categories.insertCategoriesAsync,
      key: "category",
      post: PostCategoriesRouteAsync,
      put: PutCategoriesIdRouteAsync,
      update: categories.updateCategoryAsync,
    },
    {
      build: buildSubcategory,
      insert: subcategories.insertSubcategoriesAsync,
      key: "subcategory",
      post: PostCategoriesSubRouteAsync,
      put: PutCategoriesSubIdRouteAsync,
      update: subcategories.updateSubcategoryAsync,
    },
  ];

  it.each(resources)("POST creates a $key from its fields", async ({
    build,
    insert,
    key,
    post,
  }) => {
    const fields = withoutId(build());

    const { status } = await callRouteAsync(post, {
      body: Object.fromEntries([[key, fields]]),
      method: "POST",
    });

    expect(status).toBe(201);
    expect(insert).toHaveBeenCalledExactlyOnceWith([fields]);
  });

  it.each(resources)("POST rejects a $key that already has an id", async ({
    build,
    insert,
    key,
    post,
  }) => {
    const { status } = await callRouteAsync(post, {
      body: Object.fromEntries([[key, build()]]),
      method: "POST",
    });

    expect(status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it.each(
    resources.flatMap((resource) => [
      { ...resource, expectedStatus: 200, wasUpdated: true },
      { ...resource, expectedStatus: 404, wasUpdated: false },
    ]),
  )("PUT updates a $key by route id with status $expectedStatus", async ({
    build,
    expectedStatus,
    key,
    put,
    update,
    wasUpdated,
  }) => {
    update.mockResolvedValue(wasUpdated);
    const fields = withoutId(build());

    const { status } = await callRouteAsync(put, {
      body: Object.fromEntries([[key, fields]]),
      method: "PUT",
      params: { id: "12" },
    });

    expect(status).toBe(expectedStatus);
    expect(update).toHaveBeenCalledExactlyOnceWith({ ...fields, id: 12 });
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

  it.each([
    {
      method: categories.deleteCategoryAsync,
      route: DeleteCategoriesIdRouteAsync,
    },
    {
      method: subcategories.deleteSubcategoryAsync,
      route: DeleteCategoriesSubIdRouteAsync,
    },
  ])("DELETE rejects a non-numeric route id", async ({ method, route }) => {
    const { json, status } = await callRouteAsync(route, {
      method: "DELETE",
      params: { id: "abc" },
    });

    expect(status).toBe(400);
    expect(json).toMatchObject({ error: { code: "invalidRouteParameters" } });
    expect(method).not.toHaveBeenCalled();
  });

  it.each([
    {
      build: buildCategory,
      key: "category",
      method: "PUT",
      route: PutCategoriesIdRouteAsync,
      update: categories.updateCategoryAsync,
    },
    {
      build: buildSubcategory,
      key: "subcategory",
      method: "PUT",
      route: PutCategoriesSubIdRouteAsync,
      update: subcategories.updateSubcategoryAsync,
    },
    {
      build: undefined,
      key: "",
      method: "DELETE",
      route: DeleteCategoriesIdRouteAsync,
      update: categories.deleteCategoryAsync,
    },
    {
      build: undefined,
      key: "",
      method: "DELETE",
      route: DeleteCategoriesSubIdRouteAsync,
      update: subcategories.deleteSubcategoryAsync,
    },
  ])("$method rejects the default record with 409 ($route.name)", async ({
    build,
    key,
    method,
    route,
    update,
  }) => {
    const { json, status } = await callRouteAsync(route, {
      body: isUndefined(build)
        ? undefined
        : Object.fromEntries([[key, withoutId(build())]]),
      method,
      params: { id: "-1" },
    });

    expect(status).toBe(409);
    expect(json).toMatchObject({ error: { code: "protectedRecord" } });
    expect(update).not.toHaveBeenCalled();
  });
});
