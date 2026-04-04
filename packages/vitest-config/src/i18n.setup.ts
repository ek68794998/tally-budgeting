import en from "@tally/i18n/strings/en";
import { vi } from "vitest";
import z from "zod";

const messagesSchema = z.record(z.string(), z.unknown());

type Messages = z.infer<typeof messagesSchema>;

const flattenMessages = (
	obj: Messages,
	prefix = "",
): Record<string, string> => {
	const record: Record<string, string> = {};

	return Object.keys(obj).reduce((acc, key) => {
		const value: unknown = obj[key];
		const parsedValue = messagesSchema.safeParse(value);
		const newKey = prefix ? `${prefix}.${key}` : key;

		if (parsedValue.success) {
			Object.assign(acc, flattenMessages(parsedValue.data, newKey));
		} else if (typeof value === "string") {
			acc[newKey] = value;
		} else {
			throw new Error(`Invalid value: ${JSON.stringify(value)}`);
		}

		return acc;
	}, record);
};

const messages = flattenMessages(en);

vi.mock("next-intl", () => ({
	useLocale: () => "en",
	useTranslations: (namespace?: string) => {
		const translate = (key: string) => {
			const fullKey = namespace ? `${namespace}.${key}` : key;
			return messages[fullKey] || key;
		};

		const richTranslate = (_key: string, _values?: unknown) => "";

		return Object.assign(translate, {
			rich: richTranslate,
		});
	},
}));
