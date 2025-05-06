import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("sessionid")?.value;
  const loggedIn = sessionId ? true : false;
  const mustBeLogged = [
    "/profile",
    "/forum/post/create-post",
    new RegExp("^/forum/post/edit/[^/]+$"),
  ];
  const cantBeLogged = [
    "/login",
    "/login/forgot-password",
    new RegExp("/login/reset-password/[^/]+"), // Regex to match /login/reset-password/[code]
  ];

  // Redirects user if they try to access a can't be logged in path while authenticated
  if (
    cantBeLogged.some((route) =>
      route instanceof RegExp
        ? route.test(request.nextUrl.pathname)
        : route === request.nextUrl.pathname
    ) &&
    loggedIn
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirects user if they try to access a login protected page while not authenticated
  if (
    mustBeLogged.some((route) =>
      route instanceof RegExp
        ? route.test(request.nextUrl.pathname)
        : route === request.nextUrl.pathname
    ) &&
    !loggedIn
  ) {
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
