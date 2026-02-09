import { type Logger as CommonLogger } from "@tally/utilities/telemetry/logger";
import type { HttpIncomingData } from "@tally/utilities/telemetry/types";

export interface Logger extends CommonLogger {
	httpIncoming: (event: string, data: HttpIncomingData) => void;
}
