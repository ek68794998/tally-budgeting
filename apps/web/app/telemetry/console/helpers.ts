import { type EventLogLevel } from "@tally/data-models/contracts/api/postEvents";

const colors = {
  debug: "\x1b[90m",
  error: "\x1b[31m",
  http: "\x1b[32m",
  info: "\x1b[34m",
  reset: "\x1b[0m",
  warn: "\x1b[33m",
} as const;

export const formatLogLevel = (level: EventLogLevel): string => {
  const color = colors[level];
  const reset = colors.reset;
  const padded = level.toUpperCase().padEnd(5, " ");
  return `${color}${padded}${reset}`;
};

export const formatTimestamp = (): string => new Date().toISOString();

export const formatData = (
  data: Record<string, unknown> | undefined,
): string => {
  if (!data || Object.keys(data).length === 0) {
    return "";
  }

  return `:: ${JSON.stringify(data, null, 2)}`;
};
