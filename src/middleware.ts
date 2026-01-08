// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { locales, defaultLocale } from "./config"; // Ensure locales is exported from config

const protectedRoutes = ["/dashboard", "/profile", "/admin"];
const adminRoutes = ["/admin"];
const tenantRoutes = ["/dashboard"];

export default async function middleware(request: NextRequest) {
  // 1. Run i18n middleware first to handle locale prefixes
  const handleI18n = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: "as-needed",
  });
  const i18nResponse = handleI18n(request);

  // 2. Get Auth Token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 3. Analyze Path (Handle Locale logic for redirects)
  const { pathname } = request.nextUrl;

  // Check if path has a locale prefix (e.g. /sw/dashboard vs /dashboard)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Extract the current locale to use in redirects
  const currentLocale = pathnameHasLocale
    ? pathname.split("/")[1]
    : defaultLocale;

  // Create a "clean" path without locale for easier role checking
  // e.g. "/sw/admin/users" becomes "/admin/users"
  const pathWithoutLocale = pathnameHasLocale
    ? `/${pathname.split("/").slice(2).join("/")}`
    : pathname;

  // 4. Determine Route Type
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );
  const isTenantRoute = tenantRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  // ----------------------------------------------------------------
  // 🔒 SECURITY & ROLE LOGIC
  // ----------------------------------------------------------------

  // Case A: Unauthenticated User trying to access Protected Route
  if (isProtectedRoute && !token) {
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case B: Authenticated ADMIN Logic
  if (token && token.role === "ADMIN") {
    // If Admin tries to go to Tenant Dashboard -> Redirect to Admin Panel
    if (isTenantRoute) {
      return NextResponse.redirect(
        new URL(`/${currentLocale}/admin`, request.url)
      );
    }
  }

  // Case C: Authenticated TENANT Logic
  if (token && token.role === "TENANT") {
    // If Tenant tries to go to Admin Panel -> Redirect to Dashboard
    if (isAdminRoute) {
      return NextResponse.redirect(
        new URL(`/${currentLocale}/dashboard`, request.url)
      );
    }
  }

  // ----------------------------------------------------------------

  // If no specific redirect occurred, return the i18n response
  return i18nResponse;
}

export const config = {
  matcher: [
    // Match all paths except API, static assets, favicon, and logos
    "/((?!api|_next/static|_next/image|favicon.ico|assets|logos).*)",
  ],
};
