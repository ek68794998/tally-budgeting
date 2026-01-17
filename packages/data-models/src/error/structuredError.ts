import { type ErrorCode } from "../contracts/errorCodes/errorCodes";

export class StructuredError extends Error {
	public readonly code: ErrorCode;
	public readonly params: Record<string, string> | undefined;

	public constructor(
		message: string,
		code: ErrorCode,
		params?: Record<string, string>,
	) {
		super(message);
		this.name = "StructuredError";
		this.code = code;
		this.params = params;
	}
}
