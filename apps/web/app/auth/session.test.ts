import { describe, expect, it } from "vitest";
import {
	createSessionToken,
	SessionTtlSeconds,
	verifySessionToken,
} from "./session";

const secret = "test-secret";
const password = "hunter2";
const now = new Date("2026-01-01T00:00:00Z");

const addSeconds = (date: Date, seconds: number) =>
	new Date(date.getTime() + seconds * 1000);

const buildToken = () => createSessionToken({ now, password, secret });

describe("session tokens", () => {
	it("round-trips a freshly created token", () => {
		expect(
			verifySessionToken(buildToken(), { now, password, secret }),
		).toEqual({ shouldRefresh: false, valid: true });
	});

	it.each([
		["undefined", undefined],
		["empty", ""],
		["no signature", "abc"],
		["too many segments", "a.b.c"],
	])("rejects a %s token", (_name, token) => {
		expect(verifySessionToken(token, { now, password, secret }).valid).toBe(
			false,
		);
	});

	it("rejects a tampered payload", () => {
		const [payload, signature] = buildToken().split(".");
		const forged = Buffer.from(
			JSON.stringify({ exp: 9_999_999_999, iat: 0, pv: "x" }),
		).toString("base64url");

		expect(payload).not.toBe(forged);
		expect(
			verifySessionToken(`${forged}.${signature}`, {
				now,
				password,
				secret,
			}).valid,
		).toBe(false);
	});

	it("rejects a tampered signature", () => {
		const [payload] = buildToken().split(".");

		expect(
			verifySessionToken(`${payload}.AAAA`, { now, password, secret })
				.valid,
		).toBe(false);
	});

	it("rejects a token signed with a different secret", () => {
		expect(
			verifySessionToken(buildToken(), {
				now,
				password,
				secret: "other-secret",
			}).valid,
		).toBe(false);
	});

	it("rejects an expired token", () => {
		expect(
			verifySessionToken(buildToken(), {
				now: addSeconds(now, SessionTtlSeconds),
				password,
				secret,
			}).valid,
		).toBe(false);
	});

	it("rejects a token after the password changes", () => {
		expect(
			verifySessionToken(buildToken(), {
				now,
				password: "new-password",
				secret,
			}).valid,
		).toBe(false);
	});

	it.each([
		[0, false],
		[SessionTtlSeconds / 2 - 1, false],
		[SessionTtlSeconds / 2 + 1, true],
		[SessionTtlSeconds - 1, true],
	])("at %i seconds old, shouldRefresh is %s", (age, shouldRefresh) => {
		expect(
			verifySessionToken(buildToken(), {
				now: addSeconds(now, age),
				password,
				secret,
			}),
		).toEqual({ shouldRefresh, valid: true });
	});
});
