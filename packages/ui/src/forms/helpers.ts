import {
  isBoolean,
  isNullOrUndefined,
} from "@ekumlin/typescript-toolkit/types";

export const buildFormData = (
  data: Record<string, string | number | boolean | File>,
): FormData => {
  const formData = new FormData();

  for (const [k, v] of Object.entries(data)) {
    if (isNullOrUndefined(v)) {
      continue;
    }

    if (v instanceof File) {
      formData.append(k, v);
    } else if (isBoolean(v)) {
      formData.append(k, String(v).toLowerCase());
    } else {
      formData.append(k, String(v));
    }
  }

  return formData;
};
