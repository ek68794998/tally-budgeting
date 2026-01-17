export interface FormatWithLocaleOptions {
	locale?: string;
}

export interface FormatNumberOptions extends FormatWithLocaleOptions {
	decimalPlaces?: number;
}

export interface FormatCurrencyOptions extends FormatWithLocaleOptions {
	currencySymbol?: string;
	showCents?: boolean;
	showCentsIfLessThanDigits?: number;
	showPlusSymbol?: boolean;
}

export const formatCurrency = (
	value: number,
	options?: FormatCurrencyOptions,
): string => {
	const {
		currencySymbol = "$",
		showCents,
		showCentsIfLessThanDigits,
		showPlusSymbol,
		...restOptions
	} = options ?? {};

	let decimalPlaces = 0;

	if (showCents) {
		decimalPlaces = 2;
	} else if (
		showCentsIfLessThanDigits &&
		Math.round(value) < 10 ** (showCentsIfLessThanDigits - 1)
	) {
		decimalPlaces = 2;
	}

	const isNegative = value < 0;
	const positiveValue = Math.abs(value);

	const formattedValue = formatNumber(positiveValue, {
		...restOptions,
		decimalPlaces,
	});

	return `${isNegative ? "-" : showPlusSymbol ? "+" : ""}${currencySymbol}${formattedValue}`;
};

export const formatNumber = (
	value: number,
	options?: FormatNumberOptions,
): string => {
	const { decimalPlaces = 0, locale = "en-US" } = options ?? {};

	return new Intl.NumberFormat(locale, {
		maximumFractionDigits: decimalPlaces,
		minimumFractionDigits: decimalPlaces,
	}).format(value);
};

export const formatPercent = (
	value: number,
	options?: FormatNumberOptions,
): string => `${formatNumber(value, options)}%`;
