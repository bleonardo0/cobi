import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes publiques - accès libre
const isPublicRoute = createRouteMatcher([
  '/',
  '/menu/(.*)',
  '/models/(.*)',
  '/api/contact(.*)',
  '/api/restaurants/(.*)',
  '/api/models(.*)',
  '/api/analytics/(.*)',
  '/api/proxy/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Si c'est une route publique, on laisse passer
  if (isPublicRoute(req)) {
    return;
  }
  
  // Sinon, on protège avec Clerk (version async pour Clerk 6.x)
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 