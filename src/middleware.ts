import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Check auth for admin routes, but allow public API like GET products if needed.
  // Wait, if it's the admin panel, the admin themselves will hit POST /api/admin/products so we should protect it too!
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const isAdminApi = req.nextUrl.pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    const basicAuth = req.headers.get('authorization');
    
    if (isAdminApi && !basicAuth) {
      return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
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
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
