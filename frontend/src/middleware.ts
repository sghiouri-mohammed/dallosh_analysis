import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /admin to /admin/overview
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/overview', request.url));
  }

  // Redirect /home to /home/overview
  if (pathname === '/home') {
    return NextResponse.redirect(new URL('/home/overview', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/home'],
};

