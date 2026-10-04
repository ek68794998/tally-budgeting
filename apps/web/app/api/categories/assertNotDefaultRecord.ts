import { Conflict } from "@ekumlin/typescript-toolkit/http";
import { HttpError } from "../handlers/httpError";

export const assertNotDefaultRecord = (id: number, defaultId: number) => {
  if (id === defaultId) {
    throw new HttpError(
      "The default record is protected",
      Conflict,
      "protectedRecord",
    );
  }
};
