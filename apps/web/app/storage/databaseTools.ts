import { type ChildProcess, spawn } from "node:child_process";
import { invariant } from "@ekumlin/typescript-toolkit/values";

const toolTimeoutMs = 5 * 60 * 1000;
const maximumStderrLength = 2000;

export class DatabaseToolError extends Error {
	public constructor(
		public readonly tool: string,
		public readonly stderr: string,
	) {
		super(`${tool} failed: ${stderr}`);
		this.name = "DatabaseToolError";
	}
}

const getPostgresEnv = (): NodeJS.ProcessEnv => {
	const { POSTGRES_CONNECTION_STRING: connectionString } = process.env;

	invariant(
		!!connectionString,
		"You must have configured the POSTGRES_CONNECTION_STRING setting in your environment's .env file.",
	);

	const url = new URL(connectionString);

	// Passed as environment variables so the password never shows up in the process list.
	return {
		...process.env,
		...Object.fromEntries([
			["PGDATABASE", decodeURIComponent(url.pathname.slice(1))],
			["PGHOST", url.hostname],
			["PGPASSWORD", decodeURIComponent(url.password)],
			["PGPORT", url.port || "5432"],
			["PGUSER", decodeURIComponent(url.username)],
		]),
	};
};

const runToolAsync = async (tool: string, args: string[]): Promise<void> => {
	const child: ChildProcess = spawn(tool, args, {
		env: getPostgresEnv(),
		timeout: toolTimeoutMs,
	});

	let stderr = "";

	child.stderr?.on("data", (chunk: Buffer) => {
		stderr = (stderr + chunk.toString()).slice(-maximumStderrLength);
	});

	const code = await new Promise<number | null>((resolve, reject) => {
		child.once("error", reject);
		child.once("close", resolve);
	});

	if (code !== 0) {
		throw new DatabaseToolError(
			tool,
			stderr.trim() || `exited with code ${code}`,
		);
	}
};

export const runPgDumpAsync = (outputPath: string): Promise<void> =>
	runToolAsync("pg_dump", [
		"--format=custom",
		"--no-owner",
		"--file",
		outputPath,
	]);

export const runPgRestoreAsync = (inputPath: string): Promise<void> =>
	runToolAsync("pg_restore", [
		"--clean",
		"--if-exists",
		"--no-owner",
		"--single-transaction",
		"--dbname",
		getPostgresEnv().PGDATABASE ?? "",
		inputPath,
	]);
