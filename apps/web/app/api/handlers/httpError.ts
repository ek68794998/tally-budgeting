import { type HttpStatusCode } from "@ekumlin/typescript-toolkit/http";
import { type ErrorCode } from "@tally/data-models/contracts/errorCodes/errorCodes";
import { getHttpErrorCode } from "@tally/data-models/contracts/errorCodes/httpErrorCodes";
import { StructuredError } from "@tally/data-models/error/structuredError";

export class HttpError extends StructuredError {
  public readonly status: HttpStatusCode;

  public constructor(
    message: string,
    status: HttpStatusCode,
    code?: ErrorCode,
    params?: Record<string, string>,
  ) {
    super(message, code || getHttpErrorCode(status), params);
    this.name = "HttpError";
    this.status = status;
  }
}
