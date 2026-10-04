import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDatabaseStatusStore } from "../state/databaseStatus";
import { useSessionStore } from "../state/session";
import { apiFetch } from "./apiFetch";

const databaseUnavailableBody = JSON.stringify({
	error: { code: "databaseUnavailable" },
	success: false,
});

describe("apiFetch", () => {
	beforeEach(() => {
		useSessionStore.getState().clear();
		useDatabaseStatusStore.getState().clear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it.each([
		{ body: null, databaseUnavailable: false, expired: true, status: 401 },
		{ body: null, databaseUnavailable: false, expired: false, status: 200 },
		{ body: null, databaseUnavailable: false, expired: false, status: 403 },
		{ body: null, databaseUnavailable: false, expired: false, status: 500 },
		{
			body: databaseUnavailableBody,
			databaseUnavailable: true,
			expired: false,
			status: 503,
		},
		{
			body: JSON.stringify({
				error: { code: "http503" },
				success: false,
			}),
			databaseUnavailable: false,
			expired: false,
			status: 503,
		},
		{
			body: "not json",
			databaseUnavailable: false,
			expired: false,
			status: 503,
		},
	])("a $status response with body $body sets expired=$expired, databaseUnavailable=$databaseUnavailable", async ({
		body,
		databaseUnavailable,
		expired,
		status,
	}) => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() => Promise.resolve(new Response(body, { status }))),
		);

		const response = await apiFetch("/api/x", { method: "POST" });

		expect(response.status).toBe(status);
		expect(useSessionStore.getState().isExpired).toBe(expired);
		expect(useDatabaseStatusStore.getState().isUnavailable).toBe(
			databaseUnavailable,
		);
	});

	it("leaves the response body readable after inspecting it", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() =>
				Promise.resolve(
					new Response(databaseUnavailableBody, { status: 503 }),
				),
			),
		);

		const response = await apiFetch("/api/x");

		await expect(response.text()).resolves.toBe(databaseUnavailableBody);
	});

	it("forwards its arguments to fetch", async () => {
		const fetchMock = vi.fn(() =>
			Promise.resolve(new Response(null, { status: 204 })),
		);
		vi.stubGlobal("fetch", fetchMock);

		await apiFetch("/api/x", { method: "DELETE" });

		expect(fetchMock).toHaveBeenCalledWith("/api/x", { method: "DELETE" });
	});
});
