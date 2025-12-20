export const buildQuery = (
	...queryParts: (string | boolean | undefined | null)[]
): string => queryParts.filter(Boolean).join("\n");
