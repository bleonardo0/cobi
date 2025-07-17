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

export default clerkMiddleware((auth, req) => {
  // Si c'est une route publique, on laisse passer
  if (isPublicRoute(req)) {
    return;
  }
  
  // Sinon, on protège avec Clerk
  auth.protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}; 