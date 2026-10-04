import { beforeEach, describe, expect, it, vi } from "vitest";
import { callRouteAsync, storageMocks } from "../testing/routeTesting";
import { PutSettingsKeyRouteAsync } from "./[key]/put";
import { GetSettingsRouteAsync } from "./get";

vi.mock(
  "../../storage/settingsClient",
  async () => (await import("../testing/routeTesting")).storageModules.settings,
);
vi.mock(
  "../../auth/verifyRequest",
  async () =>
    (await import("../testing/routeTesting")).authenticatedRequestModule,
);
vi.mock(
  "../../telemetry/telemetry",
  async () => (await import("../testing/routeTesting")).silentTelemetryModule,
);

const { settings } = storageMocks;

describe("settings routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns the database settings", async () => {
    settings.getSettingsAsync.mockResolvedValue({
      providersHidden: ["chase"],
    });

    const { json, status } = await callRouteAsync(GetSettingsRouteAsync);

    expect(status).toBe(200);
    expect(json).toEqual({
      settings: { providersHidden: ["chase"] },
      success: true,
    });
  });

  it("PUT saves a valid value", async () => {
    const { status } = await callRouteAsync(PutSettingsKeyRouteAsync, {
      body: { value: ["chase"] },
      method: "PUT",
      params: { key: "providersHidden" },
    });

    expect(status).toBe(200);
    expect(settings.putSettingAsync).toHaveBeenCalledWith("providersHidden", [
      "chase",
    ]);
  });

  it.each([
    {
      body: { value: ["nope"] },
      key: "providersHidden",
      name: "invalid value",
    },
    {
      body: { value: "dark" },
      key: "displayTheme",
      name: "local-scoped key",
    },
    { body: { value: "x" }, key: "session_secret", name: "internal key" },
    { body: { value: "x" }, key: "unknown", name: "unknown key" },
  ])("PUT rejects a $name", async ({ body, key }) => {
    const { status } = await callRouteAsync(PutSettingsKeyRouteAsync, {
      body,
      method: "PUT",
      params: { key },
    });

    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(500);
    expect(settings.putSettingAsync).not.toHaveBeenCalled();
  });
});
