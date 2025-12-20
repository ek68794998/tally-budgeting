import { type NextRequest, type NextResponse } from "next/server";

export type NextResponseFn = (
	request: NextRequest,
	context: { params: Promise<unknown> },
) => Promise<NextResponse>;
