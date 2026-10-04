export const DataErrorCodes = [
  "databaseBackupFailed",
  "databaseRestoreFailed",
  "databaseUnavailable",
  "invalidAccount",
  "invalidPassword",
  "protectedRecord",
] as const satisfies readonly string[];
