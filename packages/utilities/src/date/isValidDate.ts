export const isValidDate = (date: Date | string): boolean =>
	!Number.isNaN(new Date(date).getTime());
