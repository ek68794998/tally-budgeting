import {
	type EventLogData,
	type EventLogEntry,
} from "@tally/data-models/contracts/api/postEvents";
import type { HttpOutgoingData } from "./types";

export type HttpRequestEndKeys = "duration" | "error" | "statusCode";
export type StandardLogFn = (event: string, data?: EventLogData) => void;

export interface ProfilerCallback<TData extends object> {
	end: (data?: TData) => void;
}

export interface Logger {
	debug: StandardLogFn;
	error: StandardLogFn;
	event: (event: EventLogEntry) => void;
	httpOutgoing: (
		event: string,
		data: Omit<HttpOutgoingData, HttpRequestEndKeys>,
	) => ProfilerCallback<HttpOutgoingData>;
	info: StandardLogFn;
	profile: (
		event: string,
		data?: EventLogData,
	) => ProfilerCallback<EventLogData>;
	warn: StandardLogFn;
}
