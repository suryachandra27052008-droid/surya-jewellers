import { NextRequest } from 'next/server';
import { analyticsContext, recordShoppingStage } from '@/lib/server/shopping-analytics';
import { isRateLimited } from '@/lib/server/request-security';

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return new Response(null, { status: 403 });
  if (isRateLimited(request, 'shopping-analytics', 120, 60_000)) return new Response(null, { status: 429 });
  try {
    const raw = await request.text();
    if (raw.length > 1000) return new Response(null, { status: 413 });
    const body = JSON.parse(raw);
    if (!['product_view', 'add_to_bag', 'checkout_start'].includes(body.stage)) return new Response(null, { status: 400 });
    const context = analyticsContext(body.sessionId, request.headers);
    if (context) await recordShoppingStage(body.stage, context);
    return new Response(null, { status: 204 });
  } catch { return new Response(null, { status: 400 }); }
}
