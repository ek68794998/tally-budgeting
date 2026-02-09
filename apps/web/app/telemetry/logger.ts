import type {
	HttpIncomingData,
	HttpOutgoingData,
} from "@tally/utilities/telemetry/types";

export interface Logger {
	debug: (event: string, data?: Record<string, unknown>) => void;
	error: (event: string, data?: Record<string, unknown>) => void;
	httpIncoming: (event: string, data: HttpIncomingData) => void;
	httpOutgoing: (event: string, data: HttpOutgoingData) => void;
	info: (event: string, data?: Record<string, unknown>) => void;
	warn: (event: string, data?: Record<string, unknown>) => void;
}
