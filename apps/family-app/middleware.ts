import { NextResponse } from "next/server";

export function middleware() {
	if (process.env.VERCEL) {
		return new NextResponse(null, { status: 404 });
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
