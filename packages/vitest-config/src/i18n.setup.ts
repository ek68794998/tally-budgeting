import en from "@tally/i18n/strings/en";
import { type AbstractIntlMessages } from "next-intl";
import { vi } from "vitest";

vi.mock("next-intl", async (importOriginal) => {
	const actual = await importOriginal<typeof import("next-intl")>();

	const messages: AbstractIntlMessages = en;

	const createTranslator = (namespace?: string) =>
		actual.createTranslator({
			locale: "en",
			messages,
			namespace,
			onError: (error) => {
				throw error;
			},
			timeZone: "UTC",
		});

	const translators = new Map<
		string | undefined,
		ReturnType<typeof createTranslator>
	>();

	const getTranslator = (namespace?: string) => {
		const cached = translators.get(namespace);

		if (cached) {
			return cached;
		}

		const translator = createTranslator(namespace);
		translators.set(namespace, translator);

		return translator;
	};

	return {
		...actual,
		useLocale: () => "en",
		useTranslations: getTranslator,
	};
});
