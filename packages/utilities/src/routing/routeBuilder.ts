import { isNullOrUndefined } from "@ekumlin/typescript-toolkit/types";

const apiRoutes = {
	assets: "/api/assets",
	budget: {
		summary: "/api/budget/summary",
	},
	categories: {
		base: "/api/categories",
		sub: "/api/categories/sub",
	},
	netWorth: {
		snapshots: "/api/net-worth/snapshots",
	},
	transactions: {
		base: "/api/transactions",
		rules: {
			base: "/api/transactions/rules",
			order: "/api/transactions/rules/order",
		},
		upload: "/api/transactions/upload",
	},
} as const;

const webRoutes = {
	assets: "/assets",
	budget: "/budget",
	categories: "/categories",
	home: "/",
	netWorth: "/net-worth",
	retirement: "/retirement",
	summary: "/summary",
	transactions: {
		base: "/transactions",
		rules: "/transactions/rules",
	},
} as const;

type ExtractRoutes<T> = T extends string
	? T
	: T extends Record<string, unknown>
		? {
				[K in keyof T]: ExtractRoutes<T[K]>;
			}[keyof T]
		: never;

export type ApiRoute = ExtractRoutes<typeof apiRoutes>;

export type WebRoute = ExtractRoutes<typeof webRoutes>;

export const api = apiRoutes;

export const web = webRoutes;

interface RouteOptions {
	params?: (string | number)[];
	query?:
		| Record<string, string | number | boolean | undefined>
		| URLSearchParams;
}

export const buildApiRoute = (
	base: ApiRoute,
	options?: RouteOptions,
): string => {
	let route: string = base;

	route = buildParams(route, options);
	route = buildQuery(route, options);

	return route;
};

export const buildWebRoute = (
	base: WebRoute,
	options?: RouteOptions,
): string => {
	let route: string = base;

	route = buildParams(route, options);
	route = buildQuery(route, options);

	return route;
};

const buildParams = (
	base: string,
	options: RouteOptions | undefined,
): string => {
	let route: string = base;

	if (options?.params && options.params.length > 0) {
		const paramSegments = options.params
			.map((value) => String(value))
			.join("/");
		route = `${route}/${paramSegments}`;
	}

	return route;
};

const buildQuery = (
	base: string,
	options: RouteOptions | undefined,
): string => {
	let route: string = base;

	if (options?.query) {
		const queryParams = convertRouteQueryToSearchParams(options.query);
		const queryString = queryParams.toString();

		if (queryString) {
			route = `${route}?${queryString}`;
		}
	}

	return route;
};

const convertRouteQueryToSearchParams = (
	query: NonNullable<RouteOptions["query"]>,
): URLSearchParams => {
	if (query instanceof URLSearchParams) {
		return query;
	}

	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(query)) {
		if (isNullOrUndefined(value)) {
			continue;
		}

		searchParams.append(key, String(value));
	}

	return searchParams;
};
