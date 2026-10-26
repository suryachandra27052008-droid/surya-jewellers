import { createHash, createHmac } from 'node:crypto';
import { writeClient } from '@/lib/sanity/client';

export const SHOPPING_STAGES = ['product_view', 'add_to_bag', 'checkout_start', 'purchase'] as const;
export type AnalyticsContext = { sessionHash: string; country: string; device: string };

export function analyticsContext(sessionId: unknown, headers: Headers): AnalyticsContext | undefined {
  const secret = process.env.ENQUIRY_VERIFICATION_SECRET;
  if (!secret || typeof sessionId !== 'string' || !/^[a-f0-9-]{36}$/i.test(sessionId)) return;
  return { sessionHash: createHmac('sha256', secret).update(`shopping-session:${sessionId}`).digest('hex'),
    country: /^[A-Z]{2}$/.test(headers.get('x-vercel-ip-country') || '') ? headers.get('x-vercel-ip-country')! : 'Unknown',
    device: /mobile|android|iphone/i.test(headers.get('user-agent') || '') ? 'Mobile' : 'Desktop',
  };
}

export async function recordShoppingStage(stage: typeof SHOPPING_STAGES[number], context: AnalyticsContext, day = new Date().toISOString().slice(0, 10)) {
  const key = createHash('sha256').update(`${day}:${stage}:${context.sessionHash}`).digest('hex');
  await writeClient.createIfNotExists({ _id: `analytics.${key}`, _type: 'shoppingEvent', day, stage,
    country: context.country, device: context.device });
}

export async function cleanupShoppingAnalytics() {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60_000).toISOString().slice(0, 10);
  await writeClient.delete({ query: '*[_type == "shoppingEvent" && day < $cutoff][0...500]', params: { cutoff } });
  const orders = await writeClient.fetch<{ _id: string }[]>(
    '*[_type == "order" && defined(analytics) && _createdAt < $cutoff][0...100]{_id}', { cutoff: `${cutoff}T00:00:00Z` });
  for (const order of orders) await writeClient.patch(order._id).unset(['analytics']).commit();
}
