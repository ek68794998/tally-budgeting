import {
  BadRequest,
  NotFound,
  Unauthorized,
} from "@ekumlin/typescript-toolkit/http";
import { getHttpErrorCode } from "@tally/data-models/contracts/errorCodes/httpErrorCodes";
import { StructuredError } from "@tally/data-models/error/structuredError";
import { describe, expect, it } from "vitest";
import { HttpError } from "./httpError";

describe("HttpError", () => {
  it("creates error with status and derives code", () => {
    const error = new HttpError("Not found", NotFound);

    expect(error.message).toBe("Not found");
    expect(error.status).toBe(NotFound);
    expect(error.name).toBe("HttpError");
    expect(error.code).toBe(getHttpErrorCode(NotFound));
  });

  it("creates error with explicit code", () => {
    const error = new HttpError("Unauthorized", Unauthorized, "invalidAccount");

    expect(error.status).toBe(Unauthorized);
    expect(error.code).toBe("invalidAccount");
  });

  it("creates error with params", () => {
    const params = { resource: "user" };
    const error = new HttpError(
      "Resource not found",
      NotFound,
      "http404",
      params,
    );

    expect(error.params).toEqual(params);
  });

  it("is instance of Error and StructuredError", () => {
    const error = new HttpError("Test", BadRequest);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(StructuredError);
    expect(error).toBeInstanceOf(HttpError);
  });
});
