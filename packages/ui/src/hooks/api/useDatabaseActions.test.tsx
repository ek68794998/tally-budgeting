import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDatabaseActions } from "./useDatabaseActions";

const respondWith = (body: unknown, status = 200) =>
  vi.fn<typeof fetch>(() => Promise.resolve(Response.json(body, { status })));

describe("useDatabaseActions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the delete confirm word to drop the database", async () => {
    const fetchMock = respondWith({ success: true });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDatabaseActions());

    await result.current.dropAsync();

    const [url, init] = fetchMock.mock.calls[0] ?? [];

    expect(url).toBe("/api/database/drop");
    expect(init).toMatchObject({
      body: JSON.stringify({ confirm: "delete" }),
      method: "POST",
    });
  });

  it("uploads the backup file with the restore confirm word", async () => {
    const fetchMock = respondWith({ success: true });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useDatabaseActions());
    const file = new File(["dump"], "backup.dump");

    await result.current.restoreAsync(file);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const body = init?.body;

    expect(url).toBe("/api/database/restore");
    expect(body).toBeInstanceOf(FormData);
    expect(body instanceof FormData && body.get("confirm")).toBe("restore");
    expect(body instanceof FormData && body.get("file")).toBeInstanceOf(File);
  });

  it.each([
    {
      body: {
        error: {
          code: "databaseRestoreFailed",
          params: { stderr: "bad archive" },
        },
        success: false,
      },
      expected: "bad archive",
    },
    {
      body: { error: { code: "http500" }, success: false },
      expected: "http500",
    },
    { body: "not json", expected: "Request failed" },
  ])("throws '$expected' when the server reports a failure", async ({
    body,
    expected,
  }) => {
    vi.stubGlobal("fetch", respondWith(body, 500));
    const { result } = renderHook(() => useDatabaseActions());

    await expect(result.current.dropAsync()).rejects.toThrow(expected);
  });

  it("downloads the backup under the server's file name", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() =>
        Promise.resolve(
          new Response("PGDMP", {
            headers: new Headers([
              [
                "Content-Disposition",
                'attachment; filename="tally-2026-10-04.dump"',
              ],
            ]),
          }),
        ),
      ),
    );
    const createObjectURL = vi.fn(() => "blob:backup");
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL: vi.fn() });
    const downloads: string[] = [];
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloads.push(this.download);
      });
    const { result } = renderHook(() => useDatabaseActions());

    await result.current.backupAsync();

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(downloads).toEqual(["tally-2026-10-04.dump"]);
  });

  it("throws the server's reason instead of downloading when the backup fails", async () => {
    vi.stubGlobal(
      "fetch",
      respondWith(
        {
          error: {
            code: "databaseBackupFailed",
            params: { stderr: "spawn pg_dump ENOENT" },
          },
          success: false,
        },
        500,
      ),
    );
    const { result } = renderHook(() => useDatabaseActions());

    await expect(result.current.backupAsync()).rejects.toThrow(
      "spawn pg_dump ENOENT",
    );
  });
});
