import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { type TestProject } from "vitest/node";

declare module "vitest" {
	export interface ProvidedContext {
		pgliteDataDirPath: string;
	}
}

const execFileAsync = promisify(execFile);

/**
 * Runs `initdb` once, in a short-lived process, because PGlite never returns that memory to the OS.
 * Test workers load the resulting data directory instead of running `initdb` themselves.
 */
export default async ({ provide }: TestProject) => {
	const temporaryDirectory = await mkdtemp(join(tmpdir(), "tally-pglite-"));
	const dataDirPath = join(temporaryDirectory, "datadir.tar");

	await execFileAsync(process.execPath, [
		"--experimental-strip-types",
		fileURLToPath(new URL("./createPgliteDataDir.ts", import.meta.url)),
		dataDirPath,
	]);

	provide("pgliteDataDirPath", dataDirPath);

	return () => rm(temporaryDirectory, { force: true, recursive: true });
};
