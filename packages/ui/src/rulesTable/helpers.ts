const specialCharactersRegex = /[.*+?^${}()|[\]\\]/g;
const anySpacesRegex = /\s+/g;

export const getAutoRegexStringFromMerchantName = (
	merchantName: string,
): string =>
	merchantName
		.replace(specialCharactersRegex, "\\$&")
		.replace(anySpacesRegex, "\\s*");

export const getRegexFlags = (options: { ignoreCase?: boolean }): string => {
	let flags = "";

	if (options.ignoreCase) {
		flags += "i";
	}

	return flags;
};

export const getRegexSafe = (regex: string, flags: string): RegExp | null => {
	try {
		return new RegExp(regex, flags);
	} catch {
		return null;
	}
};
