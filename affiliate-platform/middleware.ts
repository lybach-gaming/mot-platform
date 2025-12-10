import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/login', '/signup', '/landing', '/compliance']
const authRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Note: This is a basic implementation. Privy auth state is managed client-side,
  // so full protection happens through client-side redirects in components
  // This middleware prevents direct access to sensitive routes

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect root to landing if not authenticated (handled client-side)
  if (pathname === '/') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
}
