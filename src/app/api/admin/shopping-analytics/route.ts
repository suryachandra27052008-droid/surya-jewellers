import { writeClient } from '@/lib/sanity/client';
import { SHOPPING_STAGES } from '@/lib/server/shopping-analytics';

export async function GET(request: Request) {
  const days = new URL(request.url).searchParams.get('days') === '7' ? 7 : 30;
  const since = new Date(Date.now() - (days - 1) * 24 * 60 * 60_000).toISOString().slice(0, 10);
  const rows = await writeClient.fetch<{ stage: string; country: string; device: string; day: string }[]>(
    '*[_type == "shoppingEvent" && day >= $since]{stage, country, device, day}', { since }, { cache: 'no-store' });
  const counts = Object.fromEntries(SHOPPING_STAGES.map(stage => [stage, rows.filter(row => row.stage === stage).length]));
  const breakdown = (field: 'country' | 'device') => Array.from(new Set(rows.map(row => row[field]))).map(label => ({
    label, stages: Object.fromEntries(SHOPPING_STAGES.map(stage => [stage, rows.filter(row => row[field] === label && row.stage === stage).length])),
  }));
  return Response.json({ days, counts, countries: breakdown('country'), devices: breakdown('device') }, { headers: { 'Cache-Control': 'private, no-store' } });
}
