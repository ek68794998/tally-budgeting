import { describe, expect, it } from "vitest";
import { accountProviderTypeSchema } from "../contracts/accountProviderType";
import { AccountProviders } from "./accountProviders";

describe("AccountProviders", () => {
  it("defines every provider type, keyed by its own id", () => {
    expect(Object.keys(AccountProviders).sort()).toEqual(
      [...accountProviderTypeSchema.options].sort(),
    );

    for (const [key, { id }] of Object.entries(AccountProviders)) {
      expect(id).toBe(key);
    }
  });
});
