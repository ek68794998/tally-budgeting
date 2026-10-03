import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSessionStore } from "../state/session";
import { apiFetch } from "./apiFetch";

describe("apiFetch", () => {
	beforeEach(() => {
		useSessionStore.getState().clear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it.each([
		[401, true],
		[200, false],
		[403, false],
		[500, false],
	])("a %i response marks the session expired: %s", async (status, expired) => {
		vi.stubGlobal(
			"fetch",
			vi.fn(() => Promise.resolve(new Response(null, { status }))),
		);

		const response = await apiFetch("/api/x", { method: "POST" });

		expect(response.status).toBe(status);
		expect(useSessionStore.getState().isExpired).toBe(expired);
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
