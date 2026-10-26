'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { CURRENCIES, formatPrice, type CurrencyCode } from '@/lib/currency';

type CustomerOrder = { reference: string; status: string; _createdAt: string;
  items: { name: string; quantity: number; ringSize?: number }[]; total: number; paymentCurrency?: CurrencyCode;
  paymentAmount?: string; courier?: string; trackingNumber?: string; trackingUrl?: string; fulfillmentBlocked?: boolean };

async function readOrders(signal?: AbortSignal): Promise<CustomerOrder[]> {
  const response = await fetch('/api/account/orders', { cache: 'no-store', signal });
  if (!response.ok) throw new Error('Your orders could not be loaded. Please try again.');
  return (await response.json()).orders;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    try {
      setOrders(await readOrders());
    } catch (error) { setError((error as Error).message); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const controller = new AbortController();
    readOrders(controller.signal).then(setOrders)
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  if (loading) return <p role="status" className="text-sm text-white/60 py-6">Loading your orders...</p>;
  if (error) return <div role="alert" className="text-sm text-white/70"><p>{error}</p><button onClick={() => { setLoading(true); setError(''); void load(); }} className="mt-3 inline-flex items-center gap-2 text-gold"><RefreshCw size={16} />Try again</button></div>;
  if (!orders.length) return <div className="border border-white/10 p-8 text-center"><h3 className="font-serif text-lg">No orders yet</h3><Link href="/products" className="mt-5 inline-block text-gold">Shop jewellery</Link></div>;
  return <div className="divide-y divide-white/10 border-y border-white/10">
    {orders.map(order => {
      const currency = order.paymentCurrency && Object.hasOwn(CURRENCIES, order.paymentCurrency) ? order.paymentCurrency : 'INR';
      const total = order.paymentAmount ? `${CURRENCIES[currency].symbol}${Number(order.paymentAmount).toFixed(currency === 'JPY' ? 0 : 2)}` : formatPrice(order.total, 'INR');
      const tracking = order.trackingUrl?.startsWith('https://') ? order.trackingUrl : '';
      return <article key={order.reference} className="py-5 text-sm text-white/75">
        <div className="flex flex-wrap justify-between gap-3"><p className="break-all">SJ-{order.reference}</p><p className="text-gold font-semibold">{total}</p></div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/50"><time>{new Date(order._createdAt).toLocaleDateString()}</time><span className="capitalize">{order.fulfillmentBlocked ? 'Under review' : order.status}</span></div>
        <ul className="mt-4 space-y-1">{order.items?.map((item, index) => <li key={index}>{item.name} <span className="text-white/45">x {item.quantity}</span>{item.ringSize !== undefined && <span className="ml-2 text-white/65">Ring size (India): {item.ringSize}</span>}</li>)}</ul>
        {order.trackingNumber && <p className="mt-3">{order.courier}: {order.trackingNumber}</p>}
        {tracking && <a href={tracking} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-gold">Track parcel<ExternalLink size={14} /></a>}
      </article>;
    })}
  </div>;
}
