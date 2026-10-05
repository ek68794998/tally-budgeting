import { type ChildProcess, spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { dangerouslyCoerceType } from "@ekumlin/typescript-toolkit/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DatabaseToolError,
  runPgDumpAsync,
  runPgRestoreAsync,
} from "./databaseTools";

vi.mock("node:child_process", () => ({ spawn: vi.fn() }));

const launchWith = (outcome: {
  code?: number;
  error?: Error;
  stderr?: string;
}) => {
  const child = Object.assign(new EventEmitter(), {
    stderr: new EventEmitter(),
  });

  vi.mocked(spawn).mockImplementation(() => {
    queueMicrotask(() => {
      if (outcome.stderr) {
        child.stderr.emit("data", Buffer.from(outcome.stderr));
      }

      if (outcome.error) {
        child.emit("error", outcome.error);
      } else {
        child.emit("close", outcome.code ?? 0);
      }
    });

    return dangerouslyCoerceType<ChildProcess>(child);
  });
};

describe("database tools", () => {
  beforeEach(() => {
    vi.stubEnv(
      "POSTGRES_CONNECTION_STRING",
      "postgres://tally:p%40ss@db.local:6543/budget",
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("runs pg_dump with the connection details in the environment, not the arguments", async () => {
    launchWith({ code: 0 });

    await runPgDumpAsync("/tmp/out.dump");

    const [tool, args, options] = vi.mocked(spawn).mock.calls[0] ?? [];

    expect(tool).toBe("pg_dump");
    expect(args).toEqual([
      "--format=custom",
      "--no-owner",
      "--file",
      "/tmp/out.dump",
    ]);
    expect(JSON.stringify(args)).not.toContain("p@ss");
    expect(options?.env).toMatchObject(
      Object.fromEntries([
        ["PGDATABASE", "budget"],
        ["PGHOST", "db.local"],
        ["PGPASSWORD", "p@ss"],
        ["PGPORT", "6543"],
        ["PGUSER", "tally"],
      ]),
    );
  });

  it("runs pg_restore as a clean, single-transaction restore", async () => {
    launchWith({ code: 0 });

    await runPgRestoreAsync("/tmp/in.dump");

    const [tool, args] = vi.mocked(spawn).mock.calls[0] ?? [];

    expect(tool).toBe("pg_restore");
    expect(args).toEqual(
      expect.arrayContaining([
        "--clean",
        "--if-exists",
        "--single-transaction",
        "/tmp/in.dump",
      ]),
    );
  });

  it.each([
    {
      expected: "bad archive",
      outcome: { code: 1, stderr: "bad archive\n" },
    },
    { expected: "exited with code 2", outcome: { code: 2 } },
  ])("throws a DatabaseToolError with '$expected' on a non-zero exit", async ({
    expected,
    outcome,
  }) => {
    launchWith(outcome);

    await expect(runPgRestoreAsync("/tmp/in.dump")).rejects.toThrow(
      DatabaseToolError,
    );
    launchWith(outcome);
    await expect(runPgRestoreAsync("/tmp/in.dump")).rejects.toThrow(expected);
  });

  it("rejects when the tool can't be launched", async () => {
    launchWith({ error: new Error("spawn pg_dump ENOENT") });

    await expect(runPgDumpAsync("/tmp/out.dump")).rejects.toThrow("ENOENT");
  });
});
