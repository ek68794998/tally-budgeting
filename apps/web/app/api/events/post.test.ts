import { type EventLogEntry } from "@tally/data-models/contracts/api/postEvents";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, telemetryLogger } from "../testing/routeTesting";
import { PostEventsRouteAsync } from "./post";

vi.mock(
	"../../telemetry/telemetry",
	async () => (await import("../testing/routeTesting")).silentTelemetryModule,
);

const buildEvent = (event: string): EventLogEntry => ({
	event,
	level: "info",
	source: "FRONTEND",
	timestamp: "2025-01-01T00:00:00.000Z",
});

const postEventsAsync = (events: EventLogEntry[], ip: string) =>
	callRouteAsync(PostEventsRouteAsync, {
		body: { events },
		headers: [["x-forwarded-for", ip]],
		method: "POST",
	});

describe("PostEventsRouteAsync", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("logs each event without requiring authentication", async () => {
		const { status } = await postEventsAsync(
			[buildEvent("a"), buildEvent("b")],
			"203.0.113.1",
		);

		expect(status).toBe(204);
		expect(telemetryLogger.event).toHaveBeenCalledTimes(2);
		expect(telemetryLogger.event).toHaveBeenCalledWith(buildEvent("b"));
	});

	it("throttles once a client has sent more than 100 events in the window", async () => {
		const events = Array.from({ length: 60 }, (_, i) => buildEvent(`${i}`));

		const first = await postEventsAsync(events, "203.0.113.2");
		const second = await postEventsAsync(events, "203.0.113.2");

		expect(first.status).toBe(204);
		expect(second.status).toBe(429);
		expect(telemetryLogger.event).toHaveBeenCalledTimes(60);
	});
});
