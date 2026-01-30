import z from "zod";

export const ReorderPositions = ["up", "down", "top", "bottom"] as const;

export const reorderPositionSchema = z.enum(ReorderPositions);

export type ReorderPosition = z.infer<typeof reorderPositionSchema>;
