import { NextResponse, type NextRequest } from "next/server";

/** Invitation codes are uppercase; send hand-typed lowercase codes to the canonical URL. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const upper = pathname.toUpperCase().replace("/INVITE/", "/invite/");
  if (upper === pathname) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = upper;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/invite/:code",
};
