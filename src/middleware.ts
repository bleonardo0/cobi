import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/menu/(.*)',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/api/restaurants/by-slug/(.*)/models',
  '/api/restaurants/(.*)',
  '/api/models',
  '/api/analytics/track-view',
  '/api/analytics/model-views/(.*)',
  '/api/contact(.*)',
  '/api/proxy/(.*)',
  '/models/(.*)',
  '/test-ar-android',
  '/test-ios-ar',
  '/test-usdz',
  '/test-simple',
  '/test-colors',
  '/test-hotspots'
]);

const isPublicApiRoute = createRouteMatcher([
  '/api/contact(.*)',
  '/api/webhooks/clerk',
  '/api/restaurants/by-slug/(.*)/models',
  '/api/restaurants/(.*)',
  '/api/models',
  '/api/analytics/track-view',
  '/api/analytics/model-views/(.*)',
  '/api/proxy/(.*)'
]);

export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith('/menu/') || 
      pathname.startsWith('/models/') ||
      pathname.startsWith('/api/restaurants/') ||
      pathname.startsWith('/api/models') ||
      pathname.startsWith('/api/analytics/track-view') ||
      pathname.startsWith('/api/contact') ||
      pathname.startsWith('/api/proxy/') ||
      pathname.startsWith('/api/webhooks/clerk')) {
    return;
  }

  if (isPublicRoute(req) || isPublicApiRoute(req)) {
    return;
  }

  auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 