import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes that require authentication
  const protectedRoutes = ['/profile'];
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Authentication routes (should not be accessed if already authenticated)
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Redirect unauthenticated users to login if they try to access protected routes
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect authenticated users to home page if they try to access authentication routes
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};