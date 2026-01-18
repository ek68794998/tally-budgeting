import { describe, expect, it } from "vitest";
import { searchParamsToObject } from "./searchParamsToObject";

describe("searchParamsToObject", () => {
	it("should convert single parameters to object", () => {
		const params = new URLSearchParams("name=John&age=30");

		expect(searchParamsToObject(params)).toEqual({
			age: "30",
			name: "John",
		});
	});

	it("should handle empty URLSearchParams", () => {
		const params = new URLSearchParams("");

		expect(searchParamsToObject(params)).toEqual({});
	});

	it("should handle duplicate keys as array", () => {
		const params = new URLSearchParams("tag=red&tag=blue&tag=green");

		expect(searchParamsToObject(params)).toEqual({
			tag: ["red", "blue", "green"],
		});
	});

	it("should handle mix of single and duplicate keys", () => {
		const params = new URLSearchParams("name=John&tag=red&tag=blue&age=30");

		expect(searchParamsToObject(params)).toEqual({
			age: "30",
			name: "John",
			tag: ["red", "blue"],
		});
	});

	it("should handle parameters with empty values", () => {
		const params = new URLSearchParams("name=&email=test@example.com");

		expect(searchParamsToObject(params)).toEqual({
			email: "test@example.com",
			name: "",
		});
	});

	it("should handle URL-encoded values", () => {
		const params = new URLSearchParams(
			"message=Hello%20World&name=John%20Doe",
		);

		expect(searchParamsToObject(params)).toEqual({
			message: "Hello World",
			name: "John Doe",
		});
	});

	it("should handle special characters in values", () => {
		const params = new URLSearchParams();
		params.append("email", "test+user@example.com");
		params.append("path", "/api/v1/users");

		expect(searchParamsToObject(params)).toEqual({
			email: "test+user@example.com",
			path: "/api/v1/users",
		});
	});

	it.each([
		["two duplicates", "id=1&id=2", { id: ["1", "2"] }],
		["three duplicates", "id=1&id=2&id=3", { id: ["1", "2", "3"] }],
		[
			"four duplicates",
			"id=1&id=2&id=3&id=4",
			{ id: ["1", "2", "3", "4"] },
		],
	])("should handle %s", (_description, query, expected) => {
		const params = new URLSearchParams(query);
		expect(searchParamsToObject(params)).toEqual(expected);
	});

	it("should preserve order of duplicate values", () => {
		const params = new URLSearchParams(
			"priority=low&priority=medium&priority=high",
		);

		expect(searchParamsToObject(params)).toEqual({
			priority: ["low", "medium", "high"],
		});
	});

	it("should handle complex query strings", () => {
		const params = new URLSearchParams(
			"search=test&filter=active&filter=pending&sort=date&page=1",
		);

		expect(searchParamsToObject(params)).toEqual({
			filter: ["active", "pending"],
			page: "1",
			search: "test",
			sort: "date",
		});
	});

	it("should handle parameters with numeric-like values as strings", () => {
		const params = new URLSearchParams("id=123&price=45.99&count=0");

		expect(searchParamsToObject(params)).toEqual({
			count: "0",
			id: "123",
			price: "45.99",
		});
	});

	it("should handle parameters constructed programmatically", () => {
		const params = new URLSearchParams();
		params.append("name", "Alice");
		params.append("tag", "typescript");
		params.append("tag", "testing");
		params.append("active", "true");

		expect(searchParamsToObject(params)).toEqual({
			active: "true",
			name: "Alice",
			tag: ["typescript", "testing"],
		});
	});

	it("should handle keys with special characters", () => {
		const params = new URLSearchParams();
		params.append("user[name]", "John");
		params.append("user[email]", "john@example.com");

		expect(searchParamsToObject(params)).toEqual({
			/* eslint-disable @typescript-eslint/naming-convention */
			"user[email]": "john@example.com",
			"user[name]": "John",
			/* eslint-enable @typescript-eslint/naming-convention */
		});
	});
});
