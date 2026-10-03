import { renderHook, waitFor } from "@testing-library/react";
import { DateTime } from "luxon";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { createQueryClientWrapper } from "../../testing/queryClient";
import { useSpendingData } from "./useSpendingData";

const spending = {
	spending: [{ spentCents: 500, subcategoryId: 1 }],
	spentOnNeedsCents: 500,
	spentOnSavingsCents: 0,
	spentOnWantsCents: 0,
	success: true,
};

const startDate = DateTime.fromISO("2025-01-01T00:00:00.000Z", { zone: "utc" });
const endDate = DateTime.fromISO("2025-01-31T00:00:00.000Z", { zone: "utc" });

let fetchMock: Mock<typeof fetch>;

describe("useSpendingData", () => {
	beforeEach(() => {
		fetchMock = vi.fn<typeof fetch>(() =>
			Promise.resolve(new Response(JSON.stringify(spending))),
		);
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("fetches spending for the date range", async () => {
		const { wrapper } = createQueryClientWrapper();

		const { result } = renderHook(
			() =>
				useSpendingData(
					startDate.isValid ? startDate : undefined,
					endDate.isValid ? endDate : undefined,
				),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.data).toEqual(spending);
		});

		const input = fetchMock.mock.lastCall?.[0];
		const url = new URL(
			typeof input === "string" ? input : "",
			"http://localhost",
		);

		expect(url.pathname).toBe("/api/budget/spending");
		expect(Object.fromEntries(url.searchParams)).toEqual({
			endDate: "2025-01-31T00:00:00.000Z",
			startDate: "2025-01-01T00:00:00.000Z",
		});
	});

	it("waits for both dates before fetching", () => {
		const { wrapper } = createQueryClientWrapper();

		const { result } = renderHook(
			() =>
				useSpendingData(
					undefined,
					endDate.isValid ? endDate : undefined,
				),
			{ wrapper },
		);

		expect(result.current.data).toBeUndefined();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("surfaces a malformed response without retrying", async () => {
		fetchMock.mockImplementation(() => Promise.resolve(new Response("{}")));
		const { wrapper } = createQueryClientWrapper();

		const { result } = renderHook(
			() =>
				useSpendingData(
					startDate.isValid ? startDate : undefined,
					endDate.isValid ? endDate : undefined,
				),
			{ wrapper },
		);

		await waitFor(() => {
			expect(result.current.error).not.toBeNull();
		});
		expect(fetchMock).toHaveBeenCalledOnce();
	});
});
