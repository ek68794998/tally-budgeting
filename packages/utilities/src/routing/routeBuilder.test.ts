import { describe, expect, it } from "vitest";
import { api, buildApiRoute, buildWebRoute, web } from "./routeBuilder";

describe("routeBuilder", () => {
	describe("api routes", () => {
		it("should provide static API routes", () => {
			expect(api.transactions.base).toBe("/api/transactions");
			expect(api.transactions.upload).toBe("/api/transactions/upload");
			expect(api.transactions.rules.base).toBe("/api/transactions/rules");
			expect(api.transactions.rules.order).toBe(
				"/api/transactions/rules/order",
			);
			expect(api.assets).toBe("/api/assets");
			expect(api.budget.summary).toBe("/api/budget/summary");
			expect(api.categories.base).toBe("/api/categories");
			expect(api.categories.sub).toBe("/api/categories/sub");
			expect(api.netWorth.snapshots).toBe("/api/net-worth/snapshots");
		});

		it("should build API routes without params", () => {
			expect(buildApiRoute("/api/transactions")).toBe(
				"/api/transactions",
			);
		});

		it("should build API routes with single param", () => {
			expect(
				buildApiRoute("/api/transactions", { params: ["123"] }),
			).toBe("/api/transactions/123");
		});

		it("should build API routes with multiple params", () => {
			expect(
				buildApiRoute("/api/transactions/rules", {
					params: ["456", "edit"],
				}),
			).toBe("/api/transactions/rules/456/edit");
		});

		it("should handle numeric params", () => {
			expect(
				buildApiRoute("/api/budget/summary", { params: [2024, 3] }),
			).toBe("/api/budget/summary/2024/3");
		});

		it("should build API routes with query params", () => {
			const route = buildApiRoute("/api/transactions", {
				query: {
					limit: 10,
					offset: 0,
				},
			});
			expect(route).toBe("/api/transactions?limit=10&offset=0");
		});

		it("should handle mixed query param types", () => {
			const route = buildApiRoute("/api/transactions", {
				query: {
					filter: "recent",
					includeDeleted: true,
					limit: 10,
				},
			});
			// Query param order may vary, so check for presence
			expect(route).toContain("/api/transactions?");
			expect(route).toContain("limit=10");
			expect(route).toContain("includeDeleted=true");
			expect(route).toContain("filter=recent");
		});

		it("should filter out undefined query params", () => {
			const route = buildApiRoute("/api/transactions", {
				query: {
					limit: 10,
					offset: undefined,
				},
			});
			expect(route).toBe("/api/transactions?limit=10");
		});

		it("should return base route when no query params", () => {
			expect(buildApiRoute("/api/transactions")).toBe(
				"/api/transactions",
			);
		});

		it("should handle empty params array", () => {
			expect(buildApiRoute("/api/transactions", { params: [] })).toBe(
				"/api/transactions",
			);
		});

		it("should build API routes with both params and query", () => {
			const route = buildApiRoute("/api/transactions", {
				params: ["123", "edit"],
				query: {
					debug: true,
					returnTo: "summary",
				},
			});
			expect(route).toContain("/api/transactions/123/edit?");
			expect(route).toContain("returnTo=summary");
			expect(route).toContain("debug=true");
		});
	});

	describe("web routes", () => {
		it("should provide static web routes", () => {
			expect(web.home).toBe("/");
			expect(web.transactions.base).toBe("/transactions");
			expect(web.transactions.rules).toBe("/transactions/rules");
			expect(web.budget).toBe("/budget");
			expect(web.assets).toBe("/assets");
			expect(web.summary).toBe("/summary");
			expect(web.retirement).toBe("/retirement");
			expect(web.categories).toBe("/categories");
			expect(web.netWorth).toBe("/net-worth");
		});

		it("should build web routes without params", () => {
			expect(buildWebRoute("/transactions")).toBe("/transactions");
		});

		it("should build web routes with single param", () => {
			expect(buildWebRoute("/transactions", { params: ["123"] })).toBe(
				"/transactions/123",
			);
		});

		it("should build web routes with multiple params", () => {
			expect(buildWebRoute("/budget", { params: [2024, 3] })).toBe(
				"/budget/2024/3",
			);
		});

		it("should build web routes with query params", () => {
			const route = buildWebRoute("/transactions", {
				query: {
					filter: "recent",
					sort: "date",
				},
			});
			expect(route).toContain("/transactions?");
			expect(route).toContain("filter=recent");
			expect(route).toContain("sort=date");
		});

		it("should handle mixed query param types for web routes", () => {
			const route = buildWebRoute("/transactions", {
				query: {
					category: "food",
					page: 1,
					showDeleted: false,
				},
			});
			expect(route).toContain("/transactions?");
			expect(route).toContain("page=1");
			expect(route).toContain("showDeleted=false");
			expect(route).toContain("category=food");
		});

		it("should filter out undefined query params for web routes", () => {
			const route = buildWebRoute("/transactions", {
				query: {
					filter: "recent",
					sort: undefined,
				},
			});
			expect(route).toBe("/transactions?filter=recent");
		});

		it("should handle empty params array", () => {
			expect(buildWebRoute("/transactions", { params: [] })).toBe(
				"/transactions",
			);
		});

		it("should build web routes with both params and query", () => {
			const route = buildWebRoute("/budget", {
				params: [2024, 3],
				query: {
					compare: true,
					view: "detailed",
				},
			});
			expect(route).toContain("/budget/2024/3?");
			expect(route).toContain("view=detailed");
			expect(route).toContain("compare=true");
		});
	});
});
