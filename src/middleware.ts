import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Définir les routes qui nécessitent une authentification
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/restaurant(.*)',
  '/api/admin(.*)',
  '/api/models(.*)',
  '/api/analytics(.*)',
  '/api/restaurants(.*)',
  '/api/users(.*)',
  '/models(.*)/edit',
  '/upload(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Protéger les routes sensibles
  if (isProtectedRoute(req)) {
    const authData = await auth();
    if (!authData.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 