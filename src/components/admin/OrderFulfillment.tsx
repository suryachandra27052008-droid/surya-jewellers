'use client';

import { useState } from 'react';
import { Save, Printer } from 'lucide-react';
import Link from 'next/link';

export default function OrderFulfillment({ order, onSaved }: { order: { _id: string; courier?: string; trackingNumber?: string; trackingUrl?: string; internalNotes?: string }; onSaved: () => void }) {
  const [fields, setFields] = useState({ courier: order.courier || '', trackingNumber: order.trackingNumber || '',
    trackingUrl: order.trackingUrl || '', internalNotes: order.internalNotes || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const save = async () => {
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order._id, ...fields }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save delivery details.');
      setMessage('Saved'); onSaved();
    } catch (error) { setMessage((error as Error).message); } finally { setSaving(false); }
  };
  return <div className="mt-5 border-t border-gray-200 pt-4">
    <div className="grid gap-3 sm:grid-cols-2">
      {(['courier', 'trackingNumber', 'trackingUrl'] as const).map(key => <label key={key} className="text-xs text-gray-600">
        {{ courier: 'Courier', trackingNumber: 'Tracking number', trackingUrl: 'Tracking link (HTTPS)' }[key]}
        <input value={fields[key]} onChange={event => setFields({ ...fields, [key]: event.target.value })}
          type={key === 'trackingUrl' ? 'url' : 'text'} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" />
      </label>)}
      <label className="text-xs text-gray-600 sm:col-span-2">Internal notes
        <textarea value={fields.internalNotes} onChange={event => setFields({ ...fields, internalNotes: event.target.value })}
          rows={3} maxLength={3000} className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm" />
      </label>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded bg-gray-900 px-3 py-2 text-xs text-white disabled:opacity-50"><Save size={15} />{saving ? 'Saving...' : 'Save details'}</button>
      <Link href={`/admin/orders/${encodeURIComponent(order._id)}/packing-slip`} target="_blank" className="inline-flex items-center gap-2 text-xs text-gray-700"><Printer size={15} />Packing slip</Link>
      <p role="status" className="text-xs text-gray-700">{message}</p>
    </div>
  </div>;
}
