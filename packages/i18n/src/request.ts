import fs from "node:fs/promises";
import path from "node:path";
import { type DeepPartial } from "@tally/data-models/utility/deepPartial";
import { match } from "@formatjs/intl-localematcher";
import deepmerge from "deepmerge";
import Negotiator from "negotiator";
import { headers } from "next/headers";
import { type AppConfig, hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { DefaultLocale, Locales } from "./locales";

type Messages = AppConfig["Messages"];

export const getLocaleAsync = async () => {
	const requestHeaders = await headers();
	const requestHeaderEntries = Object.fromEntries(requestHeaders.entries());
	const negotiator = new Negotiator({ headers: requestHeaderEntries });
	const locale = match(negotiator.languages(), Locales, DefaultLocale);
	return locale;
};

const getMessagesAsync = async (
	locale: string,
): Promise<DeepPartial<Messages>> => {
	let messages: DeepPartial<Messages>;

	// This is safe since Messages is typed based on the contents of `en.json`,
	// which is guaranteed to be loaded.
	/* eslint-disable @typescript-eslint/no-unsafe-assignment */
	if (process.env.NODE_ENV === "development") {
		const { default: strings } = await import(`./strings/${locale}.json`);
		messages = strings;
	} else {
		const importPath = path.resolve(
			process.cwd(),
			"strings",
			`${locale}.json`,
		);
		const fileContent = await fs.readFile(`${importPath}`, "utf-8");
		messages = JSON.parse(fileContent);
	}
	/* eslint-enable @typescript-eslint/no-unsafe-assignment */

	return messages;
};

export const requestConfig = getRequestConfig(async ({ requestLocale }) => {
	const requested =
		(await requestLocale) || (await getLocaleAsync()) || DefaultLocale;
	const locale = hasLocale(Locales, requested) ? requested : DefaultLocale;

	const localeStrings = await getMessagesAsync(locale);
	const defaultLocaleStrings = await getMessagesAsync(DefaultLocale);

	// This is safe since `defaultLocaleStrings` is what defines the shape of `Messages`.
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	const mergedStrings = deepmerge(
		defaultLocaleStrings,
		localeStrings,
	) as Messages;

	return {
		locale,
		messages: mergedStrings,
	};
});
