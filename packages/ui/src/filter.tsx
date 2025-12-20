export const filterMatches = (filter: string, value: string): boolean => {
	if (!filter) {
		return true;
	}

	const filterLower = filter.toLowerCase();
	const valueLower = value.toLowerCase();

	return valueLower.includes(filterLower);
};
