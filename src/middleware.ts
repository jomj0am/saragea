// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { defaultLocale } from './config';

const protectedRoutes = ['/dashboard', '/profile', '/admin'];
const adminRoutes = ['/admin'];

export default async function middleware(request: NextRequest) {
    // 1. Kwanza, endesha i18n middleware. Inashughulikia redirects za locale.
    const i18nResponse = createIntlMiddleware({
        locales: ['en', 'sw', 'fr'],
        defaultLocale,
        localePrefix: 'as-needed'
    })(request);
    
    // 2. Kisha, endelea na logic ya Auth
    const pathname = request.nextUrl.pathname;
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    const isProtectedRoute = protectedRoutes.some(route => pathname.includes(route));

    if (isProtectedRoute && !token) {
        const loginUrl = new URL(`/${request.nextUrl.locale || defaultLocale}/login`, request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    const isAdminRoute = adminRoutes.some(route => pathname.includes(route));
    if (isAdminRoute && token?.role !== 'ADMIN') {
        const unauthorizedUrl = new URL(`/${request.nextUrl.locale || defaultLocale}/unauthorized`, request.url);
        return NextResponse.redirect(unauthorizedUrl);
    }
    
    // Kama hakuna sheria ya auth iliyovunjwa, ruhusu response ya i18n iendelee
    return i18nResponse;
}

export const config = {
  matcher: [
    // Skip API, Next internals, favicon, assets, AND logos
    '/((?!api|_next/static|_next/image|favicon.ico|assets|logos).*)',
  ],};