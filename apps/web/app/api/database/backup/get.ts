import { createReadStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toError } from "@ekumlin/typescript-toolkit/error";
import {
  ContentDisposition,
  ContentType,
  InternalServerError,
  Ok,
} from "@ekumlin/typescript-toolkit/http";
import { ApplicationOctetStream } from "@ekumlin/typescript-toolkit/io";
import { DateTime } from "luxon";
import z from "zod";
import {
  DatabaseToolError,
  runPgDumpAsync,
} from "../../../storage/databaseTools";
import { telemetry } from "../../../telemetry/telemetry";
import { createApiHandler } from "../../handlers/createApiHandler";
import { HttpError } from "../../handlers/httpError";
import { type NextResponseFn } from "../../types";

export const GetDatabaseBackupRouteAsync: NextResponseFn = createApiHandler({
  eventName: "GET:DATABASE/BACKUP",
  handler: async () => {
    const directory = await mkdtemp(join(tmpdir(), "tally-backup-"));
    const filePath = join(directory, "backup.dump");

    try {
      await runPgDumpAsync(filePath);
    } catch (error) {
      await rm(directory, { force: true, recursive: true });
      telemetry().error("DATABASE_BACKUP_FAILED", {
        errorMessage: toError(error).message,
      });

      throw new HttpError(
        "Backup failed",
        InternalServerError,
        "databaseBackupFailed",
        {
          stderr:
            error instanceof DatabaseToolError
              ? error.stderr
              : toError(error).message,
        },
      );
    }

    const file = createReadStream(filePath);
    const chunks: AsyncIterator<Buffer> = file[Symbol.asyncIterator]();

    file.on("close", () => {
      void rm(directory, { force: true, recursive: true });
    });

    const headers = new Headers();
    headers.set(ContentType, ApplicationOctetStream);
    headers.set(
      ContentDisposition,
      `attachment; filename="tally-${DateTime.now().toISODate()}.dump"`,
    );

    return {
      rawResponse: new Response(
        new ReadableStream<Uint8Array>({
          cancel: () => {
            file.destroy();
          },
          pull: async (controller) => {
            const result = await chunks.next();

            if (result.done) {
              controller.close();
            } else {
              controller.enqueue(result.value);
            }
          },
        }),
        { headers },
      ),
      statusCode: Ok,
    };
  },
  schemata: {
    body: z.unknown(),
    params: z.unknown(),
    query: z.unknown(),
  },
});
