import {
	type Logger as CommonLogger,
	type HttpRequestEndKeys,
	type ProfilerCallback,
} from "@tally/utilities/telemetry/logger";
import type { HttpIncomingData } from "@tally/utilities/telemetry/types";

export interface Logger extends CommonLogger {
	httpIncoming: (
		event: string,
		data: Omit<HttpIncomingData, HttpRequestEndKeys>,
	) => ProfilerCallback<HttpIncomingData>;
}
