import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toError } from "@ekumlin/typescript-toolkit/error";
import { InternalServerError, Ok } from "@ekumlin/typescript-toolkit/http";
import { Lazy } from "@ekumlin/typescript-toolkit/values";
import { postDatabaseRestoreRequestSchema } from "@tally/data-models/contracts/api/postDatabaseRestore";
import z from "zod";
import { DatabaseAdminClient } from "../../../storage/databaseAdminClient";
import { DatabaseToolError } from "../../../storage/databaseTools";
import { telemetry } from "../../../telemetry/telemetry";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
import { type NextResponseFn } from "../../types";

const databaseAdminClientLazy = new Lazy(() => new DatabaseAdminClient());

export const PostDatabaseRestoreRouteAsync: NextResponseFn = createApiHandler({
	bodyParser: async (request) => {
		const formData = await request.formData();

		return postDatabaseRestoreRequestSchema.parse({
			confirm: formData.get("confirm"),
			file: formData.get("file"),
		});
	},
	eventName: "POST:DATABASE/RESTORE",
	handler: async ({ body }) => {
		const directory = await mkdtemp(join(tmpdir(), "tally-restore-"));
		const filePath = join(directory, "backup.dump");

		try {
			await writeFile(
				filePath,
				Buffer.from(await body.file.arrayBuffer()),
			);
			await databaseAdminClientLazy.get().restoreAsync(filePath);
		} catch (error) {
			telemetry().error("DATABASE_RESTORE_FAILED", {
				errorMessage: toError(error).message,
			});

			if (error instanceof DatabaseToolError) {
				throw new HttpError(
					"Restore failed",
					InternalServerError,
					"databaseRestoreFailed",
					{ stderr: error.stderr },
				);
			}

			throw error;
		} finally {
			await rm(directory, { force: true, recursive: true });
		}

		return { statusCode: Ok };
	},
	schemata: {
		body: postDatabaseRestoreRequestSchema,
		params: z.unknown(),
		query: z.unknown(),
	},
});
