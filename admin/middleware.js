import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const sessionCookie = request.cookies.get('ci_session');

  if (!sessionCookie && !url.pathname.startsWith('/login')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (sessionCookie && url.pathname === '/login') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico|public|.*\\.(css|js|woff2?|ttf|ico|json|txt|xml|map)$).*)'
  ],
};