import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDateWindow } from "./helpers";

describe("budgetSpendingPage helpers", () => {
	describe("getDateWindow", () => {
		describe("both dates undefined or invalid", () => {
			beforeEach(() => {
				vi.useFakeTimers();
			});

			afterEach(() => {
				vi.useRealTimers();
			});

			it("should return start and end of previous month when both are undefined", () => {
				vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
				const [start, end] = getDateWindow(undefined, undefined);

				expect(start.toISODate()).toBe("2024-02-01");
				expect(end.toISODate()).toBe("2024-02-29"); // 2024 is a leap year
			});

			it("should return start and end of previous month when both are invalid strings", () => {
				vi.setSystemTime(new Date("2024-04-10T12:00:00Z"));
				const [start, end] = getDateWindow(
					"not-a-date",
					"also-not-a-date",
				);

				expect(start.toISODate()).toBe("2024-03-01");
				expect(end.toISODate()).toBe("2024-03-31");
			});

			it("should return valid DateTime instances", () => {
				const [start, end] = getDateWindow(undefined, undefined);

				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
			});

			it("start should be at beginning of day", () => {
				vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
				const [start] = getDateWindow(undefined, undefined);

				expect(start.hour).toBe(0);
				expect(start.minute).toBe(0);
				expect(start.second).toBe(0);
				expect(start.millisecond).toBe(0);
			});

			it("end should be at end of day", () => {
				vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
				const [, end] = getDateWindow(undefined, undefined);

				expect(end.hour).toBe(23);
				expect(end.minute).toBe(59);
				expect(end.second).toBe(59);
				expect(end.millisecond).toBe(999);
			});
		});

		describe("both dates provided", () => {
			it("should return start of day for startDate and end of day for endDate", () => {
				const [start, end] = getDateWindow("2024-01-15", "2024-02-15");

				expect(start.toISODate()).toBe("2024-01-15");
				expect(start.hour).toBe(0);
				expect(start.minute).toBe(0);
				expect(start.second).toBe(0);
				expect(start.millisecond).toBe(0);
				expect(end.toISODate()).toBe("2024-02-15");
				expect(end.hour).toBe(23);
				expect(end.minute).toBe(59);
				expect(end.second).toBe(59);
				expect(end.millisecond).toBe(999);
			});

			it("should strip time component from dates with times", () => {
				const [start, end] = getDateWindow(
					"2024-01-15T14:30:45.123",
					"2024-02-15T22:45:59.999",
				);

				expect(start.toISODate()).toBe("2024-01-15");
				expect(start.hour).toBe(0);
				expect(start.minute).toBe(0);
				expect(start.second).toBe(0);
				expect(start.millisecond).toBe(0);
				expect(end.toISODate()).toBe("2024-02-15");
				expect(end.hour).toBe(23);
				expect(end.minute).toBe(59);
				expect(end.second).toBe(59);
				expect(end.millisecond).toBe(999);
			});

			it("should return valid DateTime instances", () => {
				const [start, end] = getDateWindow("2024-01-15", "2024-02-15");

				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
			});
		});

		describe("only startDate provided", () => {
			it("should set endDate to startDate plus one month", () => {
				const [start, end] = getDateWindow("2024-01-15", undefined);

				expect(start.toISODate()).toBe("2024-01-15");
				expect(end.toISODate()).toBe("2024-02-15");
			});

			it("should use end of day for derived endDate", () => {
				const [, end] = getDateWindow("2024-01-15", undefined);

				expect(end.hour).toBe(23);
				expect(end.minute).toBe(59);
				expect(end.second).toBe(59);
				expect(end.millisecond).toBe(999);
			});

			it("should handle invalid endDate the same as undefined", () => {
				const [start, end] = getDateWindow("2024-01-15", "bad");

				expect(start.toISODate()).toBe("2024-01-15");
				expect(end.toISODate()).toBe("2024-02-15");
			});

			it("should return valid DateTime instances", () => {
				const [start, end] = getDateWindow("2024-06-01", undefined);

				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
			});
		});

		describe("only endDate provided", () => {
			it("should set startDate to endDate minus one month", () => {
				const [start, end] = getDateWindow(undefined, "2024-02-15");

				expect(start.toISODate()).toBe("2024-01-15");
				expect(end.toISODate()).toBe("2024-02-15");
			});

			it("should use start of day for derived startDate", () => {
				const [start] = getDateWindow(undefined, "2024-02-15");

				expect(start.hour).toBe(0);
				expect(start.minute).toBe(0);
				expect(start.second).toBe(0);
				expect(start.millisecond).toBe(0);
			});

			it("should handle invalid startDate the same as undefined", () => {
				const [start, end] = getDateWindow("bad", "2024-02-15");

				expect(start.toISODate()).toBe("2024-01-15");
				expect(end.toISODate()).toBe("2024-02-15");
			});

			it("should return valid DateTime instances", () => {
				const [start, end] = getDateWindow(undefined, "2024-06-01");

				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
			});
		});

		describe("leap year dates", () => {
			it.each([
				[
					"as startDate with explicit endDate",
					"2024-02-29",
					"2024-03-15",
					"2024-02-29",
					"2024-03-15",
				],
				[
					"as endDate with explicit startDate",
					"2024-01-15",
					"2024-02-29",
					"2024-01-15",
					"2024-02-29",
				],
			])("should handle Feb 29 %s", (_label, startIn, endIn, expectedStart, expectedEnd) => {
				const [start, end] = getDateWindow(startIn, endIn);

				expect(start.toISODate()).toBe(expectedStart);
				expect(end.toISODate()).toBe(expectedEnd);
				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
			});

			it("should derive endDate one month after Feb 29 (leap year)", () => {
				// Feb 29 + 1 month = Mar 29
				const [start, end] = getDateWindow("2024-02-29", undefined);

				expect(start.toISODate()).toBe("2024-02-29");
				expect(end.toISODate()).toBe("2024-03-29");
				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
			});

			it("should derive startDate one month before Mar 31 landing on Feb 29 (leap year)", () => {
				// Mar 31 - 1 month = Feb 29 in a leap year
				const [start, end] = getDateWindow(undefined, "2024-03-31");

				expect(start.toISODate()).toBe("2024-02-29");
				expect(end.toISODate()).toBe("2024-03-31");
				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
			});

			it("should return Feb 1–29 as previous month when current month is March 2024", () => {
				vi.useFakeTimers();
				vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
				const [start, end] = getDateWindow(undefined, undefined);

				expect(start.toISODate()).toBe("2024-02-01");
				expect(end.toISODate()).toBe("2024-02-29");
				vi.useRealTimers();
			});
		});

		describe("DST boundary dates", () => {
			it("should handle the US spring-forward date (Mar 10, 2024) as startDate", () => {
				const [start, end] = getDateWindow("2024-03-10", "2024-04-10");

				expect(start.toISODate()).toBe("2024-03-10");
				expect(end.toISODate()).toBe("2024-04-10");
				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
			});

			it("should handle the US fall-back date (Nov 3, 2024) as endDate", () => {
				const [start, end] = getDateWindow("2024-10-01", "2024-11-03");

				expect(start.toISODate()).toBe("2024-10-01");
				expect(end.toISODate()).toBe("2024-11-03");
				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
			});

			it("should strip times on DST transition dates and return valid DateTimes", () => {
				// Times in the ambiguous/missing DST hour
				const [start, end] = getDateWindow(
					"2024-03-10T02:30:00", // falls in the spring-forward gap (clocks jump 2:00→3:00)
					"2024-11-03T01:30:00", // falls in the fall-back repeated hour
				);

				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
				expect(start.toISODate()).toBe("2024-03-10");
				expect(start.hour).toBe(0);
				expect(end.toISODate()).toBe("2024-11-03");
				expect(end.hour).toBe(23);
			});
		});

		describe("ISO dates with timezone offsets", () => {
			it("should handle dates with positive timezone offsets", () => {
				const [start, end] = getDateWindow(
					"2024-01-15T14:30:00+05:30",
					"2024-02-15T08:00:00+05:30",
				);

				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
				expect(start.hour).toBe(0);
				expect(end.hour).toBe(23);
			});

			it("should handle dates with negative timezone offsets", () => {
				const [start, end] = getDateWindow(
					"2024-01-15T20:00:00-08:00",
					"2024-02-15T06:00:00-08:00",
				);

				expect(start.isValid).toBe(true);
				expect(end.isValid).toBe(true);
				expect(start.hour).toBe(0);
				expect(end.hour).toBe(23);
			});
		});
	});
});
