import type { NextIntlAppConfig } from "@tally/i18n/types";

export type * from "next-intl";

declare module "next-intl" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
	interface AppConfig extends NextIntlAppConfig {}
}
