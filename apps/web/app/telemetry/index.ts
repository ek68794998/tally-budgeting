import { eventLogLevelSchema } from "@tally/data-models/contracts/api/postEvents";
import { ConsoleLogger } from "./console/consoleLogger";
import type { Logger } from "./logger";

class Telemetry {
	private static instance: Telemetry | undefined;
	private logger: Logger;

	private constructor() {
		const logLevelEnv = eventLogLevelSchema.safeParse(
			process.env.LOG_LEVEL,
		);
		const logLevel = logLevelEnv.success ? logLevelEnv.data : "info";
		this.logger = new ConsoleLogger(logLevel);
	}

	public static getInstance(): Telemetry {
		if (!Telemetry.instance) {
			Telemetry.instance = new Telemetry();
		}

		return Telemetry.instance;
	}

	public getLogger(): Logger {
		return this.logger;
	}

	public setLogger(logger: Logger): void {
		this.logger = logger;
	}
}

export const telemetry = Telemetry.getInstance().getLogger();
