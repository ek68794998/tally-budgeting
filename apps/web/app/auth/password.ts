import { createHash, timingSafeEqual } from "node:crypto";

const hash = (value: string): Buffer =>
  createHash("sha256").update(value).digest();

export const isPasswordCorrect = (candidate: string, actual: string): boolean =>
  timingSafeEqual(hash(candidate), hash(actual));
