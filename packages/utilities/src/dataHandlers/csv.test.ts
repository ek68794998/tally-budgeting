import { describe, expect, it } from "vitest";
import { processCsvFile } from "./csv";

describe("processCsvFile", () => {
	it("should extract CSV content after header lines", () => {
		const input = [
			"Account Summary",
			"Generated on 2024-01-01",
			"",
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
			"2024-01-02,Lunch,12.50",
		].join("\n");

		const expected = [
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
			"2024-01-02,Lunch,12.50",
		].join("\n");

		expect(processCsvFile(input)).toBe(expected);
	});

	it("should handle CSV that starts immediately with data", () => {
		const input = [
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
		].join("\n");

		expect(processCsvFile(input)).toBe(input);
	});

	it("should stop at first empty line after CSV data", () => {
		const input = [
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
			"",
			"Footer information",
			"More footer data",
		].join("\n");

		const expected = [
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
		].join("\n");

		expect(processCsvFile(input)).toBe(expected);
	});

	it.each([
		["a single blank line", [""]],
		["multiple blank lines", ["", "", ""]],
	])("should not stop if there's %s after the headers", (_description, blankLines) => {
		const input = [
			"Date,Description,Amount",
			...blankLines,
			"2024-01-01,Coffee,5.00",
			"",
			"Footer information",
			"More footer data",
		].join("\n");

		const expected = [
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
		].join("\n");

		expect(processCsvFile(input)).toBe(expected);
	});

	it("should trim whitespace from each line", () => {
		const input = [
			"  Date,Description,Amount  ",
			"  2024-01-01,Coffee,5.00  ",
			"  2024-01-02,Lunch,12.50  ",
		].join("\n");

		const expected = [
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
			"2024-01-02,Lunch,12.50",
		].join("\n");

		expect(processCsvFile(input)).toBe(expected);
	});

	it.each([
		[
			"with single header line",
			["Header", "Name,Value", "2024,100"].join("\n"),
		],
		[
			"with multiple header lines",
			["Header1", "Header2", "Header3", "Name,Value", "2024,100"].join(
				"\n",
			),
		],
		["with no header lines", ["Name,Value", "2024,100"].join("\n")],
	])("should handle CSV %s", (_description, input) => {
		const result = processCsvFile(input);
		expect(result).toContain("Name,Value");
		expect(result).toContain("2024,100");
		expect(result).not.toContain("Header");
	});

	it("should skip header lines without commas", () => {
		const input = [
			"Account Statement",
			"Customer Report",
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
		].join("\n");

		const result = processCsvFile(input);
		expect(result).not.toContain("Account Statement");
		expect(result).not.toContain("Customer Report");
		expect(result).toContain("Date,Description,Amount");
	});

	it("should return empty string for input with no commas", () => {
		const input = [
			"Header line",
			"Another header",
			"No CSV data here",
		].join("\n");

		expect(processCsvFile(input)).toBe("");
	});

	it("should handle empty input", () => {
		expect(processCsvFile("")).toBe("");
	});

	it("should handle input with only whitespace", () => {
		expect(processCsvFile("   \n   \n   ")).toBe("");
	});

	it("should handle CSV with empty lines in header section", () => {
		const input = [
			"Header",
			"",
			"",
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
		].join("\n");

		const expected = [
			"Date,Description,Amount",
			"2024-01-01,Coffee,5.00",
		].join("\n");

		expect(processCsvFile(input)).toBe(expected);
	});

	it("should preserve commas within CSV values", () => {
		const input = [
			"Date,Description,Amount",
			'2024-01-01,"Coffee, Tea",5.00',
			'2024-01-02,"Lunch, Dinner",25.00',
		].join("\n");

		expect(processCsvFile(input)).toContain('"Coffee, Tea"');
		expect(processCsvFile(input)).toContain('"Lunch, Dinner"');
	});

	describe("with comma-delimited preamble lines", () => {
		const expected = [
			"Date,Investment,Transaction Type,Amount,Shares/Unit",
			'09/10/2026,ABCDEF,Contributions,"100.00","1.000"',
		].join("\n");

		it.each([
			[
				"separated by blank lines",
				[
					"Plan name:,MYPLANNAME          ",
					"Date Range,09/01/2026 - 09/30/2026,,,,",
					"",
					"",
					"Date,Investment,Transaction Type,Amount,Shares/Unit",
					'09/10/2026,ABCDEF,Contributions,"100.00","1.000"',
				],
			],
			[
				"not separated by blank lines",
				[
					"  Plan name:,MYPLANNAME",
					"Date Range,09/01/2026 - 09/30/2026,,,,  ",
					"Date,Investment,Transaction Type,Amount,Shares/Unit",
					'09/10/2026,ABCDEF,Contributions,"100.00","1.000"',
				],
			],
			[
				"with Windows line endings",
				[
					"Plan name:,MYPLANNAME\r",
					"Date Range,09/01/2026 - 09/30/2026,,,,\r",
					"\r",
					"Date,Investment,Transaction Type,Amount,Shares/Unit\r",
					'09/10/2026,ABCDEF,Contributions,"100.00","1.000"\r',
				],
			],
			[
				"whose cell count matches the header",
				[
					"Plan name:,MYPLANNAME,,,",
					"Date,Investment,Transaction Type,Amount,Shares/Unit",
					'09/10/2026,ABCDEF,Contributions,"100.00","1.000"',
				],
			],
		])("should skip preamble lines %s", (_description, inputLines) => {
			expect(processCsvFile(inputLines.join("\n"))).toBe(expected);
		});
	});

	it("should find the header when the first data row spans multiple lines", () => {
		const input = [
			"Generated,2024-01-01",
			"Date,Description,Amount",
			'2024-01-01,"Coffee',
			'and tea",5.00',
		].join("\n");

		const expected = [
			"Date,Description,Amount",
			'2024-01-01,"Coffee',
			'and tea",5.00',
		].join("\n");

		expect(processCsvFile(input)).toBe(expected);
	});

	it("should fall back to the first line with commas when no header is followed by a matching row", () => {
		const input = ["Header", "Date,Description,Amount"].join("\n");

		expect(processCsvFile(input)).toBe("Date,Description,Amount");
	});
});
