import z from "zod";
import { DataErrorCodes } from "./dataErrorCodes";
import { HttpErrorCodes } from "./httpErrorCodes";
import { RequestErrorCodes } from "./requestErrorCodes";

export const ErrorCodes = [
	...DataErrorCodes,
	...HttpErrorCodes,
	...RequestErrorCodes,
] as const satisfies readonly string[];

export type ErrorCode = (typeof ErrorCodes)[number];

export const ErrorCodesMap = Object.fromEntries(
	ErrorCodes.map((code) => [code, code]),
);

export const errorCodeSchema = z.enum(ErrorCodes);

export const isErrorCode = (code: unknown): code is ErrorCode =>
	errorCodeSchema.safeParse(code).success;
