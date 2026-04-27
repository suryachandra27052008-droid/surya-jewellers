import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/checkout(.*)', '/account(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isPublicProductsGet =
    req.method === 'GET' && pathname === '/api/admin/products';

  if (isPublicProductsGet) {
    return NextResponse.next();
  }

  if (isAdminPage || isAdminApi) {
    const basicAuth = req.headers.get('authorization');

    if (isAdminApi && !basicAuth) {
      return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const decodedString = atob(authValue);
      const [user, pwd] = decodedString.split(':');
      if (user === 'admin' && pwd === 'Good@luck123') {
        return NextResponse.next();
      }
    }

    if (isAdminApi) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' },
    });
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
}, { proxyUrl: 'https://clerk.suryajewellers.com' });

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
