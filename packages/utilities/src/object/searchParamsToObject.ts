export const searchParamsToObject = (
  searchParams: URLSearchParams,
): unknown => {
  const obj: Record<string, unknown> = {};

  for (const [key, value] of searchParams.entries()) {
    if (key in obj) {
      const existing = obj[key];

      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        obj[key] = [existing, value];
      }
    } else {
      obj[key] = value;
    }
  }

  return obj;
};
