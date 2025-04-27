import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  console.log("MIDDLEWARE");

  const sessionId = request.cookies.get("sessionid")?.value;
  const loggedIn = sessionId ? true : false;
  const protectedPaths = ["/forum"];

  if (request.nextUrl.pathname === "/login" && loggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (protectedPaths.includes(request.nextUrl.pathname) && !loggedIn) {
    const original_destination = request.nextUrl.pathname;
    return NextResponse.redirect(
      new URL(`/login?redirect=${original_destination}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
