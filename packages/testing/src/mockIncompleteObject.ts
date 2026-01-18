export const mockIncompleteObject = <T>(incompleteObject: Partial<T>): T =>
	incompleteObject as T; // eslint-disable-line @typescript-eslint/consistent-type-assertions
