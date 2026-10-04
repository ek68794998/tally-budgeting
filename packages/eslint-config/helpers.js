/**
 * @param {string} fileExtension
 * @returns {string | [string, ...object]}
 */
export const getNamingConventionsRule = (fileExtension) => {
  if (fileExtension === "d.ts") {
    return "off"; // Allow globals to be UPPER_CASE.
  }

  return [
    "error",
    {
      format: ["strictCamelCase"],
      selector: "default",
    },
    {
      filter: {
        match: true,
        regex: "^(_id$|compatibilityJSON$|toISOString$|aria-|data-)",
      },
      format: null,
      selector: "default",
    },
    {
      filter: {
        match: true,
        regex: "Component$",
      },
      format: ["StrictPascalCase"],
      selector: "default",
    },
    !fileExtension.endsWith("sx") && {
      format: null,
      modifiers: ["async"],
      selector: ["function", "variable"],
      suffix: ["Async"],
    },
    {
      format: null,
      leadingUnderscore: "require",
      modifiers: ["unused"],
      selector: ["parameter", "variable"],
    },
    {
      format: ["camelCase", "PascalCase"],
      selector: "import",
    },
    {
      format: [
        fileExtension.endsWith("sx") ? "StrictPascalCase" : null,
        "camelCase",
        "PascalCase",
      ].filter(Boolean),
      modifiers: ["exported"],
      selector: "variable",
    },
    {
      format: [
        fileExtension.endsWith("sx") ? "StrictPascalCase" : null,
        "camelCase",
      ].filter(Boolean),
      selector: "variable",
    },
    {
      filter: {
        match: true,
        regex: "^(&|--)",
      },
      format: null,
      selector: "objectLiteralProperty",
    },
    {
      format: [
        fileExtension.endsWith("sx") ? "StrictPascalCase" : null,
        "camelCase",
      ].filter(Boolean),
      selector: "objectLiteralProperty",
    },
    {
      filter: {
        match: true,
        regex: "^(OData)",
      },
      format: ["PascalCase"],
      selector: ["class", "enum", "interface", "typeAlias"],
    },
    {
      format: ["StrictPascalCase"],
      selector: ["class", "enum", "interface", "typeAlias"],
    },
    {
      format: ["PascalCase"],
      selector: "typeParameter",
    },
    {
      format: ["UPPER_CASE"],
      modifiers: ["static", "readonly"],
      selector: "classProperty",
    },
  ].filter(Boolean);
};
