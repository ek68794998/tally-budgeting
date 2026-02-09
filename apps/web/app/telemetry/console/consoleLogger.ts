import {
	type EventLogLevel,
	type EventSource,
} from "@tally/data-models/contracts/api/postEvents";
import { sanitizeHeaders } from "@tally/utilities/telemetry/helpers";
import type {
	HttpIncomingData,
	HttpOutgoingData,
} from "@tally/utilities/telemetry/types";
import type { Logger } from "../logger";
import { formatData, formatLogLevel, formatTimestamp } from "./helpers";

export class ConsoleLogger implements Logger {
	private readonly minLevel: EventLogLevel;
	private readonly levelPriority: Record<EventLogLevel, number> = {
		debug: 4,
		error: 0,
		http: 3,
		info: 2,
		warn: 1,
	};

	public constructor(minLevel: EventLogLevel = "info") {
		this.minLevel = minLevel;
	}

	public error(event: string, data?: Record<string, unknown>): void {
		this.log("error", event, data);
	}

	public warn(event: string, data?: Record<string, unknown>): void {
		this.log("warn", event, data);
	}

	public info(event: string, data?: Record<string, unknown>): void {
		this.log("info", event, data);
	}

	public debug(event: string, data?: Record<string, unknown>): void {
		this.log("debug", event, data);
	}

	public httpIncoming(event: string, data: HttpIncomingData): void {
		const sanitizedData: Record<string, unknown> = {
			...data,
			direction: "INCOMING",
		};

		if (data.headers) {
			sanitizedData.headers = sanitizeHeaders(data.headers);
		}

		this.log("http", event, sanitizedData);
	}

	public httpOutgoing(event: string, data: HttpOutgoingData): void {
		const sanitizedData: Record<string, unknown> = {
			...data,
			direction: "OUTGOING",
		};

		if (data.headers) {
			sanitizedData.headers = sanitizeHeaders(data.headers);
		}

		this.log("http", event, sanitizedData);
	}

	private log(
		level: EventLogLevel,
		event: string,
		data?: Record<string, unknown>,
	): void {
		if (!this.shouldLog(level)) {
			return;
		}

		const { message, ...restData } = data ?? {};

		const timestamp = formatTimestamp();
		const levelTag = formatLogLevel(level);
		const source: EventSource = "BACKEND";
		const formattedData = formatData(restData);

		const outputParts = [
			timestamp,
			levelTag,
			`[${source}]`,
			event,
			message,
			formattedData,
		].filter(Boolean);

		const output = outputParts.join(" ");

		if (level === "error") {
			console.error(output);
		} else if (level === "warn") {
			console.warn(output);
		} else {
			console.info(output);
		}
	}

	private shouldLog(level: EventLogLevel): boolean {
		return this.levelPriority[level] <= this.levelPriority[this.minLevel];
	}
}
