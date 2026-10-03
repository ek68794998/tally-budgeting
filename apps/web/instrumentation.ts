const registerAsync = async (): Promise<void> => {
	if (process.env.NEXT_RUNTIME !== "nodejs") {
		return;
	}

	const { getAuthConfig } = await import("./app/auth/config");
	const { telemetry } = await import("./app/telemetry/telemetry");

	if (getAuthConfig().mode === "disabled") {
		telemetry().warn("AUTH_DISABLED", {
			message:
				"Authentication is disabled via DANGEROUSLY_DISABLE_AUTH. Anyone who can reach this server can read and modify all data.",
		});
	}
};

export { registerAsync as register };
