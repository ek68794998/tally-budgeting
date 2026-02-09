import { ContentType, Post } from "@ekumlin/typescript-toolkit/http";
import { ApplicationJson } from "@ekumlin/typescript-toolkit/io";
import {
	type EventLogData,
	type EventLogLevel,
	type PostEventsRequest,
} from "@tally/data-models/contracts/api/postEvents";
import { sanitizeHeaders } from "../helpers";
import type { Logger } from "../logger";
import type { EventLogEntry, HttpOutgoingData } from "../types";

export class BatchingLogger implements Logger {
	private readonly endpoint: string;
	private readonly flushInterval: number;
	private readonly maxBatchSize: number;

	private batch: EventLogEntry[] = [];
	private timerId: ReturnType<typeof setTimeout> | null = null;

	public constructor(
		endpoint: string,
		maxBatchSize = 50,
		flushInterval = 10000,
	) {
		this.endpoint = endpoint;
		this.maxBatchSize = maxBatchSize;
		this.flushInterval = flushInterval;
		this.startTimer();
	}

	public error(event: string, data?: EventLogData): void {
		this.log("error", event, data);
		this.flush();
	}

	public warn(event: string, data?: EventLogData): void {
		this.log("warn", event, data);
	}

	public info(event: string, data?: EventLogData): void {
		this.log("info", event, data);
	}

	public debug(event: string, data?: EventLogData): void {
		this.log("debug", event, data);
	}

	public httpOutgoing(event: string, data: HttpOutgoingData): void {
		let headers: Record<string, unknown> | undefined;

		if (data.headers) {
			headers = sanitizeHeaders(data.headers);
		}

		this.log("http", event, {
			message: `${data.method} ${data.url}`,
			...data,
			headers,
		});
	}

	private log(
		level: EventLogLevel,
		event: string,
		data?: EventLogData,
	): void {
		const entry: EventLogEntry = {
			data,
			event,
			level,
			source: "FRONTEND",
			timestamp: new Date().toISOString(),
		};

		this.batch.push(entry);

		if (this.batch.length >= this.maxBatchSize) {
			this.flush();
		}
	}

	private flush(): void {
		if (this.batch.length === 0) {
			return;
		}

		const eventsToSend = [...this.batch];
		this.batch = [];
		this.resetTimer();

		const headers = new Headers();
		headers.set(ContentType, ApplicationJson);

		const content: PostEventsRequest = {
			events: eventsToSend,
		};

		fetch(this.endpoint, {
			body: JSON.stringify(content),
			headers,
			keepalive: true,
			method: Post,
		}).catch((error) => {
			console.warn(
				"%c[Telemetry] Failed to send events to backend",
				"color: #ff9800; font-weight: bold;",
			);
			console.warn("Error details:", error);
		});
	}

	private startTimer(): void {
		this.timerId = setTimeout(() => {
			this.flush();
		}, this.flushInterval);
	}

	private resetTimer(): void {
		if (this.timerId) {
			clearTimeout(this.timerId);
		}

		this.startTimer();
	}
}
