const registerAsync = async (): Promise<void> => {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	const { migrateToLatestAsync } = await import("./app/storage/migrate");
	await migrateToLatestAsync();
};

export { registerAsync as register };
