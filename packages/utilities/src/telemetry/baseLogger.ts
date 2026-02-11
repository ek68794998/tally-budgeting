import {
	type EventLogData,
	type EventLogLevel,
} from "@tally/data-models/contracts/api/postEvents";
import { sanitizeHeaders } from "./helpers";
import {
	type HttpRequestEndKeys,
	type Logger,
	type ProfilerCallback,
} from "./logger";
import { type HttpIncomingData, type HttpOutgoingData } from "./types";

export abstract class BaseLogger implements Logger {
	public debug(event: string, data?: EventLogData): void {
		this.log("debug", event, data);
	}

	public error(event: string, data?: EventLogData): void {
		this.log("error", event, data);
	}

	public httpOutgoing(
		event: string,
		data: HttpOutgoingData,
	): ProfilerCallback<HttpOutgoingData> {
		return this.http(event, "outgoing", data);
	}

	public info(event: string, data?: EventLogData): void {
		this.log("info", event, data);
	}

	public profile(
		event: string,
		data?: EventLogData,
	): ProfilerCallback<EventLogData> {
		const startTime = Date.now();

		this.log("info", `${event}:START`, data);

		return {
			end: (endData) => {
				const durationMs = Date.now() - startTime;
				this.log("info", `${event}:END`, {
					...endData,
					duration: durationMs,
				});
			},
		};
	}

	public warn(event: string, data?: EventLogData): void {
		this.log("warn", event, data);
	}

	protected http(
		event: string,
		direction: "incoming" | "outgoing",
		data: Omit<HttpIncomingData | HttpOutgoingData, HttpRequestEndKeys>,
	): ProfilerCallback<HttpIncomingData | HttpOutgoingData> {
		const startTime = Date.now();

		let headers: Record<string, unknown> | undefined;

		if (data.headers) {
			headers = sanitizeHeaders(data.headers);
		}

		const identifier = String(
			"path" in data ? data.path : "url" in data ? data.url : "(unknown)",
		);

		this.log("http", `${event}:START`, {
			message: `${data.method} ${identifier}`,
			...data,
			direction,
			headers,
		});

		return {
			end: (endData) => {
				const durationMs = Date.now() - startTime;
				this.log("http", `${event}:END`, {
					...endData,
					duration: durationMs,
				});
			},
		};
	}

	protected abstract log(
		level: EventLogLevel,
		event: string,
		data?: EventLogData,
	): void;
}
