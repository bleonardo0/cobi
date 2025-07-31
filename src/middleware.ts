import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes publiques (pas besoin d'authentification)
const isPublicRoute = createRouteMatcher([
  '/api/restaurants/by-slug/(.*)', // Accès public aux restaurants par slug
  '/menu/(.*)', // Pages menu publiques
  '/api/contact(.*)', // Contact public
  '/api/webhooks(.*)', // Webhooks publics
]);

// Définir les routes qui nécessitent une authentification
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/restaurant(.*)',
  '/api/admin(.*)',
  '/api/models(.*)',
  '/api/analytics(.*)',
  '/api/restaurants/(.*)', // Protéger toutes les routes restaurants (mais on vérifie les publiques en premier)
  '/api/users(.*)',
  '/models(.*)/edit',
  '/upload(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Permettre l'accès aux routes publiques sans authentification
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
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