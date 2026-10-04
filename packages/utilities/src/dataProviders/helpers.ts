import { keysOf } from "@ekumlin/typescript-toolkit/collections";
import type z from "zod";

const getZodIssueMessage = (issue: z.core.$ZodIssue): string => issue.message;

export const validateIsStatementRow = <T>(
  obj: unknown,
  schema: z.ZodSchema<T>,
  validationErrors: string[],
): obj is T => {
  const parsedObj = schema.safeParse(obj);

  if (parsedObj.success) {
    return true;
  }

  const { fieldErrors, formErrors } =
    parsedObj.error.flatten(getZodIssueMessage);

  validationErrors.push(
    ...formErrors,
    ...keysOf(fieldErrors).map(
      (field) => `${String(field)}: ${fieldErrors[field]?.join(", ")}`,
    ),
  );

  return false;
};
