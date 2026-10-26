'use client';
import { useEffect, useState } from 'react';

const stages = { product_view: 'Viewed a product', add_to_bag: 'Added to bag', checkout_start: 'Started checkout', purchase: 'Purchased' };
type Counts = Record<keyof typeof stages, number>;
type Breakdown = { label: string; stages: Counts }[];

export default function ShoppingFunnel() {
  const [days, setDays] = useState('30');
  const [data, setData] = useState<{ counts: Counts; countries: Breakdown; devices: Breakdown } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/admin/shopping-analytics?days=${days}`, { signal: abort.signal, cache: 'no-store' })
      .then(async response => { if (!response.ok) throw new Error('Shopping analytics could not be loaded.'); return response.json(); })
      .then(result => { setData(result); setError(''); }).catch(error => { if (error.name !== 'AbortError') setError(error.message); });
    return () => abort.abort();
  }, [days]);
  return <section className="border-y border-gray-200 py-6">
    <div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-gray-900">Shopping funnel</h2><select aria-label="Shopping analytics period" value={days} onChange={event => setDays(event.target.value)} className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></div>
    <p className="mt-2 text-xs text-gray-500">Opt-in sessions by stage. Purchases are confirmed server-side. Collection starts when enabled; historical visits are not reconstructed.</p>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {!data && !error && <p role="status" className="mt-4 text-sm text-gray-500">Loading...</p>}
    {data && <><div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">{Object.entries(stages).map(([stage, label]) => <div key={stage}><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-2xl font-semibold text-gray-900">{data.counts[stage as keyof Counts]}</p></div>)}</div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">{(['countries', 'devices'] as const).map(group => <div key={group}><h3 className="text-sm font-medium capitalize">{group}</h3><table className="mt-2 w-full text-left text-xs"><thead><tr><th className="py-2 font-normal text-gray-500">{group === 'countries' ? 'Country' : 'Device'}</th><th className="text-right font-normal text-gray-500">Checkout</th><th className="text-right font-normal text-gray-500">Purchased</th></tr></thead><tbody>{data[group].slice(0, 20).map(row => <tr key={row.label} className="border-t border-gray-100"><td className="py-2">{row.label}</td><td className="text-right">{row.stages.checkout_start}</td><td className="text-right">{row.stages.purchase}</td></tr>)}</tbody></table>{!data[group].length && <p className="mt-2 text-xs text-gray-500">No recorded sessions yet.</p>}</div>)}</div>
    </>}
  </section>;
}
