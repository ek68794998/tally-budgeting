import { invariant, unreachable } from "@ekumlin/typescript-toolkit/values";
import { type Asset } from "@tally/data-models/contracts/asset";
import { type Transaction } from "@tally/data-models/contracts/transaction";
import { AppleDataProvider } from "./apple";
import { ChaseDataProvider } from "./chase";
import { FidelityDataProvider } from "./fidelity";
import { FirstTechFederalDataProvider } from "./ftfcu";
import { GuidelineDataProvider } from "./guideline";
import { RobinhoodDataProvider } from "./robinhood";
import { type TransactionCustomizations } from "./types";

interface TransactionParseResultFailure {
	errors: string[];
	result: "failure";
}

interface TransactionParseResultIgnore {
	result: "ignore";
}

interface TransactionParseResultSuccess {
	result: "success";
	transaction: Transaction;
}

type TransactionParseResult =
	| TransactionParseResultFailure
	| TransactionParseResultIgnore
	| TransactionParseResultSuccess;

export const parseRowAsTransaction = (
	inputRow: unknown,
	account: Asset,
	customizations: TransactionCustomizations,
): TransactionParseResult => {
	const validationErrors: string[] = [];
	let transaction: Transaction | undefined;

	invariant(account.provider, "Account provider must be defined");

	const setTransaction = (t: Omit<Transaction, "id" | "notes">) => {
		transaction = { ...t, id: -1, notes: "" };
	};

	switch (account.provider) {
		case "apple": {
			const provider = new AppleDataProvider();

			if (
				provider.validateIsStatementRow(inputRow, validationErrors) &&
				!provider.isStatementRowIgnored(inputRow)
			) {
				setTransaction(
					provider.convertStatementRowToTransaction(
						inputRow,
						account.name,
						customizations,
					),
				);
			}

			break;
		}

		case "chase": {
			const provider = new ChaseDataProvider();

			if (
				provider.validateIsStatementRow(inputRow, validationErrors) &&
				!provider.isStatementRowIgnored(inputRow)
			) {
				setTransaction(
					provider.convertStatementRowToTransaction(
						inputRow,
						account.name,
						customizations,
					),
				);
			}

			break;
		}

		case "fidelity": {
			const provider = new FidelityDataProvider();

			if (
				provider.validateIsStatementRow(inputRow, validationErrors) &&
				!provider.isStatementRowIgnored(inputRow)
			) {
				setTransaction(
					provider.convertStatementRowToTransaction(
						inputRow,
						account.name,
						customizations,
					),
				);
			}

			break;
		}

		case "firstTechFederal": {
			const provider = new FirstTechFederalDataProvider();

			if (
				provider.validateIsStatementRow(inputRow, validationErrors) &&
				!provider.isStatementRowIgnored(inputRow)
			) {
				setTransaction(
					provider.convertStatementRowToTransaction(
						inputRow,
						account.name,
						customizations,
					),
				);
			}

			break;
		}

		case "guideline": {
			const provider = new GuidelineDataProvider();

			if (
				provider.validateIsStatementRow(inputRow, validationErrors) &&
				!provider.isStatementRowIgnored(inputRow)
			) {
				setTransaction(
					provider.convertStatementRowToTransaction(
						inputRow,
						account.name,
						customizations,
					),
				);
			}

			break;
		}

		case "robinhood": {
			const provider = new RobinhoodDataProvider();

			if (
				provider.validateIsStatementRow(inputRow, validationErrors) &&
				!provider.isStatementRowIgnored(inputRow)
			) {
				setTransaction(
					provider.convertStatementRowToTransaction(
						inputRow,
						account.name,
						customizations,
					),
				);
			}

			break;
		}

		default:
			unreachable(account.provider);
	}

	if (transaction) {
		return { result: "success", transaction };
	}

	if (validationErrors.length > 0) {
		return { errors: validationErrors, result: "failure" };
	}

	return { result: "ignore" };
};
