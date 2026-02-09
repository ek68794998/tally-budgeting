import { type EventLogData } from "@tally/data-models/contracts/api/postEvents";
import type { HttpOutgoingData } from "./types";

export interface Logger {
	debug: (event: string, data?: EventLogData) => void;
	error: (event: string, data?: EventLogData) => void;
	httpOutgoing: (event: string, data: HttpOutgoingData) => void;
	info: (event: string, data?: EventLogData) => void;
	warn: (event: string, data?: EventLogData) => void;
}
