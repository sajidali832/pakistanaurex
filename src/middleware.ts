import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/blog(.*)',
  '/privacy',
  '/terms',
  '/support',
  '/contact',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  if (userId && (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  if (!userId && !isPublicRoute(req)) {
    // For API routes return a JSON 401 instead of an HTML redirect to avoid
    // breaking client-side fetch calls that expect JSON.
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};