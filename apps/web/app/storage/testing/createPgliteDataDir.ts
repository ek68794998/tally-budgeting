import { writeFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const [outputPath] = process.argv.slice(2);

if (!outputPath) {
  throw new Error("Usage: node createPgliteDataDir.ts <output path>");
}

const pglite = await PGlite.create();
const dataDir = await pglite.dumpDataDir("none");

await pglite.close();
await writeFile(outputPath, Buffer.from(await dataDir.arrayBuffer()));
