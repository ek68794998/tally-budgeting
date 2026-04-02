import { parse as parseCsvSync } from "csv/sync";

export const getCsvRows = (inputCsvContent: string): unknown[] =>
	parseCsvSync(inputCsvContent, {
		columns: true,
	});

export const processCsvFile = (inputCsvContent: string) => {
	const inputCsvLines = inputCsvContent.split("\n");
	const csvLines: string[] = [];

	let foundMainSection = false;

	for (const inputCsvLine of inputCsvLines) {
		if (!foundMainSection) {
			if (inputCsvLine.includes(",")) {
				foundMainSection = true;
			} else {
				continue;
			}
		}

		const trimmedLine = inputCsvLine.trim();

		if (trimmedLine.replace(/"/g, "").length === 0) {
			break;
		}

		csvLines.push(trimmedLine);
	}

	return csvLines.join("\n");
};
