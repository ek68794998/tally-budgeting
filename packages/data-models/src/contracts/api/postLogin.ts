import z from "zod";
import { createApiResponseSchema } from "./types";

export const postLoginRequestSchema = z.object({
  password: z.string().min(1).max(1024),
});

export type PostLoginRequest = z.infer<typeof postLoginRequestSchema>;

export const postLoginResponseSchema = createApiResponseSchema({});

export type PostLoginResponse = z.infer<typeof postLoginResponseSchema>;
