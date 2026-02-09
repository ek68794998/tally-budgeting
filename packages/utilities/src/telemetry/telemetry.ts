import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { BatchingLogger } from "./batching/batchingLogger";
import type { Logger } from "./logger";

class Telemetry {
	private static instance: Telemetry | undefined;
	private logger: Logger;

	private constructor() {
		this.logger = new BatchingLogger("/api/events");
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

const lazyTelemetry = new Lazy(() => Telemetry.getInstance().getLogger());
export const telemetry = () => lazyTelemetry.get();
