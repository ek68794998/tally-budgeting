import type { Locale } from "./locales";
import type messages from "./strings/en.json";

export interface NextIntlAppConfig {
	/* Disabling naming since this has to exactly match next-intl definitions. */
	/* eslint-disable @typescript-eslint/naming-convention */
	Locale: Locale;
	Messages: typeof messages;
	/* eslint-enable @typescript-eslint/naming-convention */
}
