export const Locales = ["en", "ja"] as const;
export const DefaultLocale = Locales[0];

export type Locale = (typeof Locales)[number];
