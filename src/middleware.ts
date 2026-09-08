import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n/config";

const protectedRoutes = ["/dashboard", "/scans", "/vulnerabilidades"];
const authRoutes = ["/login", "/register"];

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;

  const pathnameWithoutLocale = pathname.replace(/^\/(pt-BR|en)(\/|$)/, "/");

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  if (isProtectedRoute && !accessToken) {
    const locale = pathname.match(/^\/(pt-BR|en)/)?.[1] || defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && accessToken) {
    const locale = pathname.match(/^\/(pt-BR|en)/)?.[1] || defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
