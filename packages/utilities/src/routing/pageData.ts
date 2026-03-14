import { getSlug } from "@ekumlin/typescript-toolkit/routing";
import { buildWebRoute, type WebRoute } from "./routeBuilder";

export interface PageData {
	href: string;
	slug: string;
	title: string;
}

export type Subpage = Omit<PageData, "slug">;

export type SubpageMap = Record<string, Subpage>;

export const buildPageData = (route: WebRoute, title: string): PageData => ({
	href: buildWebRoute(route),
	slug: getSlug(route) ?? "",
	title,
});

export const buildSubpageMap = (
	entries: Parameters<typeof buildPageData>[],
): SubpageMap =>
	entries.reduce<SubpageMap>((map, [route, title]) => {
		const { slug: _, ...rest } = buildPageData(route, title);
		map[getSlug(route) ?? ""] = rest;
		return map;
	}, {});
