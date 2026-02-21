// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createI18nMiddleware } from 'next-international/middleware';

const I18nMiddleware = createI18nMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
});

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // 1. Traitement i18n (redirections de langue si nécessaire)
  const response = I18nMiddleware(request);

  // 2. Gestion des cookies (GET) et protection CSRF (non-GET)
  if (request.method === "GET") {
    const token = request.cookies.get("session")?.value ?? null;
    if (token !== null) {
      response.cookies.set("session", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
  } else {
    // Protection CSRF pour POST/PUT/DELETE, etc.
    const originHeader = request.headers.get("Origin");
    const hostHeader = request.headers.get("Host");
    
    if (!originHeader || !hostHeader) {
      return new NextResponse(null, { status: 403 });
    }
    
    try {
      const origin = new URL(originHeader);
      if (origin.host !== hostHeader) {
        return new NextResponse(null, { status: 403 });
      }
    } catch {
      return new NextResponse(null, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)'],
};