import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/account(.*)']);

function unauthorized(isApi: boolean, message = 'Authentication required') {
  return new NextResponse(
    isApi ? JSON.stringify({ error: message }) : message,
    {
      status: 401,
      headers: isApi
        ? { 'Content-Type': 'application/json' }
        : { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
    }
  );
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isStudio = pathname.startsWith('/studio');

  if (isAdminPage || isAdminApi || isStudio) {
    const basicAuth = req.headers.get('authorization');
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('ADMIN_USERNAME and ADMIN_PASSWORD must be configured.');
      return unauthorized(isAdminApi, 'Admin access is not configured');
    }

    if (basicAuth?.startsWith('Basic ')) {
      try {
        const decodedString = atob(basicAuth.slice(6));
        const separator = decodedString.indexOf(':');
        const user = decodedString.slice(0, separator);
        const pwd = decodedString.slice(separator + 1);
        if (separator > 0 && user === adminUsername && pwd === adminPassword) {
          return NextResponse.next();
        }
      } catch {
        // Invalid Basic authentication payload.
      }
    }

    return unauthorized(isAdminApi, basicAuth ? 'Invalid credentials' : 'Authentication required');
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
