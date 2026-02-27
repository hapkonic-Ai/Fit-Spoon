import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup'];
const ONBOARDING_PATH = '/onboarding';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('chefmate_token')?.value;

  // Allow public assets and API routes through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isOnboarding = pathname.startsWith(ONBOARDING_PATH);

  if (!token) {
    // No token → redirect to login (unless already on a public page)
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // Has token → redirect away from auth pages
  if (isPublicPath) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
