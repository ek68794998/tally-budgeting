import z from "zod";

export const tooltipPayloadSchema = z.object({
  color: z.string().optional(),
  dataKey: z.string(),
  fill: z.string().optional(),
  hide: z.boolean(),
  name: z.string(),
  nameKey: z.string().optional(),
  payload: z.unknown(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  type: z.string().optional(),
  unit: z.string().optional(),
  value: z.number(),
});

export const pieChartItemDataSchema = z.object({
  color: z.string(),
  fill: z.string(),
  name: z.string(),
  total: z.number(),
  value: z.number(),
});
