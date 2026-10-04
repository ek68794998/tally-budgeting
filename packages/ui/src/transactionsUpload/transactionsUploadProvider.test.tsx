import { buildAsset } from "@tally/data-models/testing/fixtures";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TransactionsUploadProvider,
  useTransactionsUploadContext,
} from "./transactionsUploadProvider";

class FakeXmlHttpRequest {
  public static readonly DONE = 4;
  public static latest: FakeXmlHttpRequest | undefined;

  public body: FormData | undefined;
  public method = "";
  public onreadystatechange: (() => void) | null = null;
  public readyState = 0;
  public responseText = "";
  public status = 0;
  public statusText = "";
  public readonly upload: {
    onprogress: ((event: { loaded: number; total: number }) => void) | null;
  } = { onprogress: null };

  public url = "";

  public constructor() {
    FakeXmlHttpRequest.latest = this;
  }

  public finish(status: number) {
    this.readyState = 1;
    this.onreadystatechange?.();
    this.readyState = FakeXmlHttpRequest.DONE;
    this.status = status;
    this.statusText = String(status);
    this.responseText = "{}";
    this.onreadystatechange?.();
  }

  public open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  public send(body: FormData) {
    this.body = body;
  }
}

const callbacks = {
  onSelectNone: vi.fn(),
  onUploadFinish: vi.fn(),
  onUploadProgress: vi.fn(),
  onUploadStart: vi.fn(),
};

const file = new File(["a,b"], "statement.csv");

const renderUploadContext = () =>
  renderHook(useTransactionsUploadContext, {
    wrapper: TransactionsUploadProvider,
  });

describe("TransactionsUploadProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    FakeXmlHttpRequest.latest = undefined;
    vi.stubGlobal("XMLHttpRequest", FakeXmlHttpRequest);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    { expected: true, status: 200 },
    { expected: false, status: 400 },
  ])("uploads the selected file and resolves $expected for status $status", async ({
    expected,
    status,
  }) => {
    const { result } = renderUploadContext();

    act(() => {
      result.current.setAccount(buildAsset({ id: 4 }));
      result.current.setSelectedFile(file);
      result.current.setUploadCallbacks(callbacks);
    });

    let uploadPromise: Promise<boolean> | undefined;
    act(() => {
      uploadPromise = result.current.uploadSelectedFile(true);
    });

    const xhr = FakeXmlHttpRequest.latest;
    xhr?.upload.onprogress?.({ loaded: 1, total: 4 });
    xhr?.finish(status);

    await expect(uploadPromise).resolves.toBe(expected);
    expect(xhr?.method).toBe("POST");
    expect(xhr?.url).toBe("/api/transactions/upload");
    expect(Object.fromEntries(xhr?.body ?? new FormData())).toMatchObject({
      accountId: "4",
      isValidationOnly: "true",
    });
    expect(callbacks.onUploadStart).toHaveBeenCalledWith(file);
    expect(callbacks.onUploadProgress).toHaveBeenCalledWith(25);
    expect(callbacks.onUploadFinish).toHaveBeenCalledExactlyOnceWith(
      "{}",
      status,
      String(status),
    );
  });

  it("clears the previous response and skips the upload without a file", async () => {
    const { result } = renderUploadContext();

    act(() => {
      result.current.setUploadResponse({
        rowsFailed: [],
        rowsIgnored: [],
        rowsProcessed: [],
        success: true,
      });
    });

    let uploaded: boolean | undefined;
    await act(async () => {
      uploaded = await result.current.uploadFile(null, false);
    });

    expect(uploaded).toBe(false);
    expect(result.current.uploadResponse).toBeNull();
    expect(FakeXmlHttpRequest.latest).toBeUndefined();
  });

  it("reports no selection when there is no account", async () => {
    const { result } = renderUploadContext();

    act(() => {
      result.current.setUploadCallbacks(callbacks);
    });

    await expect(result.current.uploadFile(file, false)).resolves.toBe(false);
    expect(callbacks.onSelectNone).toHaveBeenCalledOnce();
    expect(FakeXmlHttpRequest.latest).toBeUndefined();
  });

  it("requires a provider", () => {
    expect(() => renderHook(useTransactionsUploadContext)).toThrow(
      "useTransactionsUploadContext must be used within a TransactionsUploadProvider",
    );
  });
});
