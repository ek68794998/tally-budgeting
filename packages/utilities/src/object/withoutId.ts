export const withoutId = <T extends { id: unknown }>(
	item: T,
): Omit<T, "id"> => {
	const { id: _, ...rest } = item;
	return rest;
};
