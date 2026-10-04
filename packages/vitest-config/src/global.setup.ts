import { vi } from "vitest";
import failOnConsole from "vitest-fail-on-console";
import explainUnmockedFetch from "./guards/fetchGuard";

failOnConsole();

globalThis.fetch = vi.fn(explainUnmockedFetch);
