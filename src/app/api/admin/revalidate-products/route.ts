import { invalidateProductCatalog } from '@/lib/server/catalog-cache';

// Admin Basic authentication is enforced by src/proxy.ts for /api/admin/*.
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  }
  invalidateProductCatalog();
  return Response.json({ refreshed: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
