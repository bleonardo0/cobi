import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes publiques - accès libre
const isPublicRoute = createRouteMatcher([
  '/',
  '/menu/(.*)',
  '/models/(.*)',
  '/test(.*)',
  '/api/contact(.*)',
  '/api/restaurants/(.*)',
  '/api/models(.*)',
  '/api/analytics/(.*)',
  '/api/proxy/(.*)',
  '/api/webhooks/clerk',
  '/sign-in(.*)',
  '/sign-up(.*)'
]);

export default clerkMiddleware((auth, req) => {
  try {
    // Si c'est une route publique, on laisse passer
    if (isPublicRoute(req)) {
      return;
    }
    
    // Vérification des variables d'environnement
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('Clerk publishable key missing, skipping auth protection');
      return;
    }
    
    // Sinon, on protège avec Clerk
    auth.protect();
  } catch (error) {
    console.error('Middleware error:', error);
    // En cas d'erreur, on laisse passer plutôt que de bloquer le site
    return;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 