import { NextResponse } from "next/server";

export function middleware() {
	if (process.env.VERCEL) {
		return new NextResponse(null, { status: 404 });
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/(.*)",
};
