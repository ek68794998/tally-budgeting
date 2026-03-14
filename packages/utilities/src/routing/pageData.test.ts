import { describe, expect, it } from "vitest";
import {
	buildPageData,
	buildSubpageMap,
	type PageData,
	type SubpageMap,
} from "./pageData";
import { type WebRoute } from "./routeBuilder";

describe("buildPageData", () => {
	it.each<[WebRoute, string, PageData]>([
		[
			"/assets",
			"Assets",
			{ href: "/assets", slug: "assets", title: "Assets" },
		],
		[
			"/budget",
			"Budget",
			{ href: "/budget", slug: "budget", title: "Budget" },
		],
		[
			"/budget/categories",
			"Categories",
			{
				href: "/budget/categories",
				slug: "categories",
				title: "Categories",
			},
		],
		[
			"/budget/spending",
			"Spending",
			{ href: "/budget/spending", slug: "spending", title: "Spending" },
		],
		[
			"/transactions/rules",
			"Rules",
			{ href: "/transactions/rules", slug: "rules", title: "Rules" },
		],
		[
			"/retirement",
			"Retirement",
			{ href: "/retirement", slug: "retirement", title: "Retirement" },
		],
	])("builds page data for %s", (route, title, expected) => {
		expect(buildPageData(route, title)).toEqual(expected);
	});

	it("uses empty string for slug when route is /", () => {
		expect(buildPageData("/", "Home")).toEqual({
			href: "/",
			slug: "",
			title: "Home",
		});
	});
});

describe("buildSubpageMap", () => {
	it("returns an empty map for no entries", () => {
		expect(buildSubpageMap([])).toEqual({});
	});

	it("maps a single entry by its slug", () => {
		expect(buildSubpageMap([["/budget/spending", "Spending"]])).toEqual({
			spending: {
				href: "/budget/spending",
				title: "Spending",
			},
		});
	});

	it.each<[[WebRoute, string][], SubpageMap]>([
		[
			[
				["/budget", "Budget"],
				["/budget/spending", "Spending"],
				["/budget/categories", "Categories"],
			],
			{
				budget: { href: "/budget", title: "Budget" },
				categories: { href: "/budget/categories", title: "Categories" },
				spending: { href: "/budget/spending", title: "Spending" },
			},
		],
		[
			[
				["/transactions/rules", "Rules"],
				["/transactions/upload", "Upload"],
			],
			{
				rules: { href: "/transactions/rules", title: "Rules" },
				upload: { href: "/transactions/upload", title: "Upload" },
			},
		],
	])("builds a map with multiple entries (case %#)", (entries, expected) => {
		expect(buildSubpageMap([...entries])).toEqual(expected);
	});
});
