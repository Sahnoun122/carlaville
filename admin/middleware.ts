import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token');
  const { pathname } = req.nextUrl;

  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Add role-based route protection here if needed
  // For example:
  // if (token && pathname.startsWith('/admin')) {
  //   // decode token and check role
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
