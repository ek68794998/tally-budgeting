import {
	type EventLogEntry,
	type EventLogLevel,
} from "@tally/data-models/contracts/api/postEvents";
import { BaseLogger } from "@tally/utilities/telemetry/baseLogger";
import {
	type HttpRequestEndKeys,
	type ProfilerCallback,
} from "@tally/utilities/telemetry/logger";
import type { HttpIncomingData } from "@tally/utilities/telemetry/types";
import { formatData, formatLogLevel, formatTimestamp } from "./helpers";

export class ConsoleLogger extends BaseLogger {
	private readonly minLevel: EventLogLevel;
	private readonly levelPriority: Record<EventLogLevel, number> = {
		debug: 4,
		error: 0,
		http: 3,
		info: 2,
		warn: 1,
	};

	public constructor(minLevel: EventLogLevel = "info") {
		super();

		this.minLevel = minLevel;
	}

	public event(entry: EventLogEntry): void {
		const { data, event, level, source, timestamp } = entry;

		if (!this.shouldLog(level)) {
			return;
		}

		const { message, ...restData } = data ?? {};

		const levelTag = formatLogLevel(level);
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

	public httpIncoming(
		event: string,
		data: Omit<HttpIncomingData, HttpRequestEndKeys>,
	): ProfilerCallback<HttpIncomingData> {
		return this.http(event, "incoming", data);
	}

	protected log(
		level: EventLogLevel,
		event: string,
		data?: Record<string, unknown>,
	): void {
		if (!this.shouldLog(level)) {
			return;
		}

		this.event({
			data,
			event,
			level,
			source: "BACKEND",
			timestamp: formatTimestamp(),
		});
	}

	private shouldLog(level: EventLogLevel): boolean {
		return this.levelPriority[level] <= this.levelPriority[this.minLevel];
	}
}
