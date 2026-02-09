import {
	type EventLogLevel,
	type EventSource,
} from "@tally/data-models/contracts/api/postEvents";
import { type HttpHeaders } from "@tally/data-models/http/headers";

export interface EventLogEntry {
	data?: Record<string, unknown>;
	event: string;
	level: EventLogLevel;
	source: EventSource;
	timestamp: string;
}

export interface HttpIncomingData {
	duration: number;
	error?: unknown;
	headers?: HttpHeaders;
	method: string;
	path: string;
	statusCode: number;
}

export interface HttpOutgoingData {
	duration?: number;
	error?: unknown;
	headers?: HttpHeaders;
	method: string;
	statusCode?: number;
	url: string;
}
