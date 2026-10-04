import { Authorization } from "@ekumlin/typescript-toolkit/http";
import { type HttpHeaders } from "@tally/data-models/http/headers";

export const sanitizeHeaders = (
  headers: HttpHeaders | undefined,
): HttpHeaders | undefined => {
  if (!headers) {
    return undefined;
  }

  const sanitizedHeaders: HttpHeaders = {};

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === Authorization.toLowerCase()) {
      sanitizedHeaders[Authorization] = "[REDACTED]";
      continue;
    }

    sanitizedHeaders[key] = value;
  }

  return sanitizedHeaders;
};
