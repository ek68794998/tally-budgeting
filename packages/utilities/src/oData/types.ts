import z from "zod";

export const oDataLiteFilterOperatorSchema = z.enum([
  "eq",
  "ne",
  "lt",
  "le",
  "gt",
  "ge",
  "in",
  "like",
] as const);

export type ODataLiteFilterOperator = z.infer<
  typeof oDataLiteFilterOperatorSchema
>;

export const oDataLiteFilterExpressionSchema = z.object({
  field: z.string(),
  operator: oDataLiteFilterOperatorSchema,
  value: z.union([z.boolean(), z.string(), z.number(), z.date(), z.null()]),
});

export type ODataLiteFilterExpression = z.infer<
  typeof oDataLiteFilterExpressionSchema
>;
