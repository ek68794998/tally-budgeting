/* eslint-disable vitest/require-top-level-describe */

import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup as cleanUpReact } from "@testing-library/react";
import { afterEach, expect } from "vitest";

expect.extend(matchers);

afterEach(() => {
  cleanUpReact();
});
