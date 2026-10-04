import { describe, expect, it } from "vitest";
import { migrationEntries, migrationProvider } from "./migrationProvider";

describe("migrationProvider", () => {
  it("has non-empty, unique, sorted names", () => {
    const names = migrationEntries.map(([name]) => name);

    expect(names.every((name) => name.length > 0)).toBe(true);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual([...names].sort());
  });

  it("provides every entry", async () => {
    const migrations = await migrationProvider.getMigrations();

    expect(Object.keys(migrations)).toEqual(
      migrationEntries.map(([name]) => name),
    );
  });
});
