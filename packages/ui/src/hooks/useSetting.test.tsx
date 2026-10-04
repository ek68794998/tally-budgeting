import { addToast } from "@heroui/react";
import { useSettingsStore } from "@tally/utilities/state/settings";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { settingStoragePrefix, useSetting } from "./useSetting";

vi.mock("@heroui/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@heroui/react")>()),
  addToast: vi.fn(),
}));
vi.mock("@tally/utilities/telemetry/telemetry", () => ({
  telemetry: () => ({ error: vi.fn() }),
}));

const themeStorageKey = `${settingStoragePrefix}displayTheme`;

describe("useSetting", () => {
  const fetchMock = vi.fn(() => Promise.resolve());
  const saveSettingAsync = vi.fn<
    ReturnType<typeof useSettingsStore.getState>["saveSettingAsync"]
  >(() => Promise.resolve(true));

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useSettingsStore.setState({
      error: null,
      fetch: fetchMock,
      isFetching: false,
      isHydrated: false,
      saveSettingAsync,
      settings: {},
    });
  });

  describe("local scope", () => {
    it("falls back to the default, then persists changes in this browser only", () => {
      const { result } = renderHook(() => useSetting("displayTheme"));

      expect(result.current[0]).toBe("system");
      expect(result.current[2]).toEqual({
        isLoading: false,
        scope: "local",
      });

      act(() => result.current[1]("dark"));

      expect(result.current[0]).toBe("dark");
      expect(localStorage.getItem(themeStorageKey)).toBe('"dark"');
      expect(saveSettingAsync).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("ignores a stored value that fails the schema", () => {
      localStorage.setItem(themeStorageKey, '"pink"');

      const { result } = renderHook(() => useSetting("displayTheme"));

      expect(result.current[0]).toBe("system");
    });
  });

  describe("database scope", () => {
    it("fetches on mount and reports loading until hydrated", () => {
      const { result } = renderHook(() => useSetting("providersHidden"));

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(result.current[0]).toEqual([]);
      expect(result.current[2]).toEqual({
        isLoading: true,
        scope: "database",
      });
    });

    it("reads from the store and saves through it", async () => {
      useSettingsStore.setState({
        isHydrated: true,
        settings: { providersHidden: ["chase"] },
      });

      const { result } = renderHook(() => useSetting("providersHidden"));

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.current[0]).toEqual(["chase"]);
      expect(result.current[2].isLoading).toBe(false);

      act(() => result.current[1](["apple"]));

      await waitFor(() => {
        expect(saveSettingAsync).toHaveBeenCalledWith("providersHidden", [
          "apple",
        ]);
      });
      expect(addToast).not.toHaveBeenCalled();
      expect(localStorage.length).toBe(0);
    });

    it("shows a toast when the save fails", async () => {
      saveSettingAsync.mockResolvedValue(false);
      useSettingsStore.setState({ isHydrated: true });

      const { result } = renderHook(() => useSetting("providersHidden"));

      act(() => result.current[1](["apple"]));

      await waitFor(() => {
        expect(addToast).toHaveBeenCalledWith(
          expect.objectContaining({ color: "danger" }),
        );
      });
    });
  });
});
