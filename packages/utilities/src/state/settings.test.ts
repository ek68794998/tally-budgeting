import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { telemetry } from "../telemetry/telemetry";
import { useSettingsStore } from "./settings";

vi.mock("../telemetry/telemetry", () => {
	const logger = { error: vi.fn() };
	return { telemetry: () => logger };
});

const respondWith = (body: unknown, status = 200) =>
	vi.fn<typeof fetch>(() => Promise.resolve(Response.json(body, { status })));

describe("useSettingsStore", () => {
	beforeEach(() => {
		useSettingsStore.setState({
			error: null,
			isFetching: false,
			isHydrated: false,
			settings: {},
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it("fetches the database settings", async () => {
		const fetchMock = respondWith({
			settings: { providersHidden: ["chase"] },
			success: true,
		});
		vi.stubGlobal("fetch", fetchMock);

		await useSettingsStore.getState().fetch();

		expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/settings");
		expect(useSettingsStore.getState()).toMatchObject({
			isHydrated: true,
			settings: { providersHidden: ["chase"] },
		});
	});

	it("records an error when the fetch response is malformed", async () => {
		vi.stubGlobal("fetch", respondWith({ nope: true }));

		await useSettingsStore.getState().fetch();

		expect(useSettingsStore.getState()).toMatchObject({
			error: "Failed to fetch settings",
			isHydrated: true,
		});
		expect(telemetry().error).toHaveBeenCalledWith(
			"STORE_FETCH_FAILED",
			expect.objectContaining({ store: "settings" }),
		);
	});

	it("applies a save optimistically and keeps it once the server accepts it", async () => {
		const fetchMock = respondWith({ success: true });
		vi.stubGlobal("fetch", fetchMock);

		const savePromise = useSettingsStore
			.getState()
			.saveSettingAsync("providersHidden", ["apple"]);

		expect(useSettingsStore.getState().settings).toEqual({
			providersHidden: ["apple"],
		});
		await expect(savePromise).resolves.toBe(true);

		const [url, init] = fetchMock.mock.calls[0] ?? [];

		expect(url).toBe("/api/settings/providersHidden");
		expect(init).toMatchObject({
			body: JSON.stringify({ value: ["apple"] }),
			method: "PUT",
		});
	});

	it.each([
		{
			name: "the server rejects it",
			response: respondWith({ success: false }, 400),
		},
		{
			name: "the request throws",
			response: vi.fn<typeof fetch>(() =>
				Promise.reject(new Error("offline")),
			),
		},
	])("rolls a save back when $name", async ({ response }) => {
		useSettingsStore.setState({ settings: { providersHidden: ["chase"] } });
		vi.stubGlobal("fetch", response);

		await expect(
			useSettingsStore
				.getState()
				.saveSettingAsync("providersHidden", ["apple"]),
		).resolves.toBe(false);

		expect(useSettingsStore.getState().settings).toEqual({
			providersHidden: ["chase"],
		});
		expect(telemetry().error).toHaveBeenCalledWith(
			"SETTING_SAVE_FAILED",
			expect.objectContaining({ key: "providersHidden" }),
		);
	});
});
