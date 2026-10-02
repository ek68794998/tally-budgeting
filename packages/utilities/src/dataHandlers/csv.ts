import { parse as parseCsvSync } from "csv/sync";

export const getCsvRows = (inputCsvContent: string): unknown[] =>
	parseCsvSync(inputCsvContent, {
		columns: true,
	});

const isBlankLine = (line: string) =>
	line.trim().replace(/"/g, "").length === 0;

const hasUnbalancedQuotes = (text: string) =>
	(text.match(/"/g)?.length ?? 0) % 2 === 1;

const parseCsvRecord = (record: string): string[] | undefined => {
	try {
		const records: string[][] = parseCsvSync(record, { trim: true });
		return records[0];
	} catch {
		// A record that can't be parsed on its own can't be a header (or the row validating one).
		return undefined;
	}
};

const getNextRecord = (lines: string[], startIndex: number) => {
	const recordLines: string[] = [];

	for (let lineIndex = startIndex; lineIndex < lines.length; lineIndex++) {
		const line = lines[lineIndex] ?? "";

		if (recordLines.length === 0 && isBlankLine(line)) {
			continue;
		}

		recordLines.push(line.trim());

		if (!hasUnbalancedQuotes(recordLines.join("\n"))) {
			return recordLines.join("\n");
		}
	}

	return undefined;
};

/**
 * The header is the first line with no empty cells whose field count matches the record after it.
 * This skips metadata preambles like `Plan name:,X` or `Date Range,X,,,,` even when they contain commas.
 */
const findHeaderLineIndex = (lines: string[]) => {
	let firstLineWithCommaIndex = -1;

	for (const [lineIndex, line] of lines.entries()) {
		if (!line.includes(",")) {
			continue;
		}

		if (firstLineWithCommaIndex === -1) {
			firstLineWithCommaIndex = lineIndex;
		}

		const headerFields = parseCsvRecord(line);

		if (!headerFields || headerFields.some((field) => field.length === 0)) {
			continue;
		}

		const nextRecord = getNextRecord(lines, lineIndex + 1);
		const nextRecordFields = nextRecord && parseCsvRecord(nextRecord);

		if (nextRecordFields?.length === headerFields.length) {
			return lineIndex;
		}
	}

	return firstLineWithCommaIndex;
};

export const processCsvFile = (inputCsvContent: string) => {
	const inputCsvLines = inputCsvContent.split("\n");
	const headerLineIndex = findHeaderLineIndex(inputCsvLines);

	if (headerLineIndex === -1) {
		return "";
	}

	const csvLines: string[] = [];
	let hasDataRows = false;

	for (const inputCsvLine of inputCsvLines.slice(headerLineIndex)) {
		if (isBlankLine(inputCsvLine)) {
			if (hasDataRows) {
				break;
			}

			continue;
		}

		if (csvLines.length >= 1) {
			hasDataRows = true;
		}

		csvLines.push(inputCsvLine.trim());
	}

	return csvLines.join("\n");
};
