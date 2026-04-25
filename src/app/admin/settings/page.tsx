'use client';

import { useState, useEffect } from 'react';
import {
  Store, Truck, CreditCard, Share2, AlertTriangle,
  CheckCircle2, Clock, Save, Download, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface StoreInfo {
  name: string;
  email: string;
  phone: string;
  altPhone: string;
  address: string;
  website: string;
}

interface ShippingSettings {
  freeShippingEnabled: boolean;
  freeShippingEndDate: string;
  freeShippingMinOrder: number;
}

interface SocialSettings {
  whatsapp: string;
  instagram: string;
}

// ── Shared UI ──────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#c9a84c]" />
        </div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] transition-colors ${props.className ?? ''}`}
    />
  );
}

function SaveButton({
  onClick,
  saved,
}: {
  onClick: () => void;
  saved: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
      style={{ backgroundColor: saved ? '#10b981' : '#c9a84c' }}
    >
      {saved ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          Saved
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          Save Changes
        </>
      )}
    </button>
  );
}

// ── Defaults ───────────────────────────────────────────────────────────────
const DEFAULT_STORE: StoreInfo = {
  name: 'Surya Jewellers',
  email: 'suryajewellersjaipur@gmail.com',
  phone: '+91 99839 39306',
  altPhone: '9358842102',
  address: 'B-169 Anandpuri, Moti Doongri Rd, near Naila House, Jaipur, Rajasthan 302004',
  website: 'suryajewellers.com',
};

const DEFAULT_SHIPPING: ShippingSettings = {
  freeShippingEnabled: true,
  freeShippingEndDate: '2026-05-04',
  freeShippingMinOrder: 2000,
};

const DEFAULT_SOCIAL: SocialSettings = {
  whatsapp: '+91 99839 39306',
  instagram: '',
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [store, setStore] = useState<StoreInfo>(DEFAULT_STORE);
  const [shipping, setShipping] = useState<ShippingSettings>(DEFAULT_SHIPPING);
  const [social, setSocial] = useState<SocialSettings>(DEFAULT_SOCIAL);

  const [storeSaved, setStoreSaved] = useState(false);
  const [shippingSaved, setShippingSaved] = useState(false);
  const [socialSaved, setSocialSaved] = useState(false);

  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setStore(load('sj_store', DEFAULT_STORE));
    setSocial(load('sj_social', DEFAULT_SOCIAL));
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setShipping({
          freeShippingEnabled: data.showFreeShippingBanner ?? DEFAULT_SHIPPING.freeShippingEnabled,
          freeShippingEndDate: data.freeShippingEndDate ?? DEFAULT_SHIPPING.freeShippingEndDate,
          freeShippingMinOrder: data.freeShippingMinOrder ?? DEFAULT_SHIPPING.freeShippingMinOrder,
        });
      })
      .catch(() => setShipping(load('sj_shipping', DEFAULT_SHIPPING)));
  }, []);

  function save<T>(key: string, value: T, setSaved: (v: boolean) => void) {
    localStorage.setItem(key, JSON.stringify(value));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function saveShipping() {
    localStorage.setItem('sj_shipping', JSON.stringify(shipping));
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        showFreeShippingBanner: shipping.freeShippingEnabled,
        freeShippingEndDate: shipping.freeShippingEndDate,
        freeShippingMinOrder: shipping.freeShippingMinOrder,
      }),
    });
    setShippingSaved(true);
    setTimeout(() => setShippingSaved(false), 2500);
  }

  async function handleClearProducts() {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    setClearing(true);
    setClearResult(null);
    try {
      const res = await fetch('/api/admin/products/clear', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setClearResult(`Deleted ${data.deleted} product${data.deleted !== 1 ? 's' : ''}.`);
      } else {
        setClearResult('Error: ' + (data.error || 'Unknown error'));
      }
    } catch {
      setClearResult('Request failed.');
    } finally {
      setClearing(false);
      setClearConfirm(false);
    }
  }

  async function handleExportCSV() {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      const products: Record<string, unknown>[] = data.products || [];
      if (products.length === 0) {
        alert('No products to export.');
        return;
      }
      const headers = [
        'ID', 'Name', 'SKU', 'Price', 'Compare At', 'Category',
        'Stone', 'Carat Weight', 'Silver Weight', 'In Stock', 'Stock Qty',
        'Featured', 'Created At',
      ];
      const rows = products.map((p) => [
        p._id,
        `"${String(p.name ?? '').replace(/"/g, '""')}"`,
        p.sku,
        p.price,
        p.compareAtPrice ?? '',
        `"${String(p.category ?? '').replace(/"/g, '""')}"`,
        p.mainStoneType ?? '',
        p.totalCaratWeight ?? '',
        p.silverWeight ?? '',
        p.inStock ? 'Yes' : 'No',
        p.stockQuantity ?? '',
        p.featured ? 'Yes' : 'No',
        p._createdAt ?? p.createdAt ?? '',
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `surya-jewellers-products-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage store configuration and preferences
        </p>
      </div>

      {/* ── 1. Store Information ── */}
      <SectionCard icon={Store} title="Store Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Store Name">
            <Input
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={store.email}
              onChange={(e) => setStore({ ...store, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={store.phone}
              onChange={(e) => setStore({ ...store, phone: e.target.value })}
            />
          </Field>
          <Field label="Alt Phone">
            <Input
              value={store.altPhone}
              onChange={(e) => setStore({ ...store, altPhone: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <Input
                value={store.address}
                onChange={(e) => setStore({ ...store, address: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Website">
            <Input
              value={store.website}
              onChange={(e) => setStore({ ...store, website: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <SaveButton onClick={() => save('sj_store', store, setStoreSaved)} saved={storeSaved} />
        </div>
      </SectionCard>

      {/* ── 2. Shipping Settings ── */}
      <SectionCard icon={Truck} title="Shipping Settings">
        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Free Shipping Banner</p>
              <p className="text-xs text-gray-500">Show free shipping promotion across the site</p>
            </div>
            <button
              onClick={() =>
                setShipping({ ...shipping, freeShippingEnabled: !shipping.freeShippingEnabled })
              }
              className="flex-shrink-0"
            >
              {shipping.freeShippingEnabled ? (
                <ToggleRight className="w-8 h-8 text-[#c9a84c]" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-300" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Free Shipping End Date">
              <Input
                type="date"
                value={shipping.freeShippingEndDate}
                onChange={(e) =>
                  setShipping({ ...shipping, freeShippingEndDate: e.target.value })
                }
              />
            </Field>
            <Field label="Minimum Order (₹)">
              <Input
                type="number"
                min={0}
                value={shipping.freeShippingMinOrder}
                onChange={(e) =>
                  setShipping({ ...shipping, freeShippingMinOrder: Number(e.target.value) })
                }
              />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <SaveButton onClick={saveShipping} saved={shippingSaved} />
        </div>
      </SectionCard>

      {/* ── 3. Payment Gateways ── */}
      <SectionCard icon={CreditCard} title="Payment Gateways Status">
        <div className="space-y-3">
          {/* Razorpay */}
          <div className="flex items-start justify-between p-3 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Razorpay</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">rzp_live_SZJ6l9bc34nLl3</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live
            </span>
          </div>

          {/* Wise */}
          <div className="flex items-start justify-between p-3 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Wise</p>
              <p className="text-xs text-gray-400 mt-0.5">International transfers</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              Pending verification
            </span>
          </div>

          {/* PayPal */}
          <div className="flex items-start justify-between p-3 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">PayPal</p>
              <p className="text-xs text-gray-400 mt-0.5">Global payments</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live
            </span>
          </div>

          {/* Payoneer */}
          <div className="flex items-start justify-between p-3 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Payoneer</p>
              <p className="text-xs text-gray-400 mt-0.5">International payouts</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Live
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── 4. Social & Contact ── */}
      <SectionCard icon={Share2} title="Social & Contact">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="WhatsApp Number">
            <Input
              value={social.whatsapp}
              onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
            />
          </Field>
          <Field label="Instagram Handle">
            <Input
              value={social.instagram}
              onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
              placeholder="@handle"
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <SaveButton
            onClick={() => save('sj_social', social, setSocialSaved)}
            saved={socialSaved}
          />
        </div>
      </SectionCard>

      {/* ── 5. Danger Zone ── */}
      <SectionCard icon={AlertTriangle} title="Danger Zone">
        <div className="space-y-4">
          {/* Clear all products */}
          <div className="flex items-start justify-between gap-4 p-4 border border-red-100 rounded-lg bg-red-50/40">
            <div>
              <p className="text-sm font-semibold text-gray-900">Clear All Products</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Permanently delete every product from Sanity. This cannot be undone.
              </p>
              {clearResult && (
                <p className="text-xs mt-1 font-medium text-red-600">{clearResult}</p>
              )}
            </div>
            <button
              onClick={handleClearProducts}
              disabled={clearing}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                clearConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white border border-red-300 text-red-600 hover:bg-red-50'
              } disabled:opacity-50`}
            >
              <Trash2 className="w-4 h-4" />
              {clearing ? 'Deleting…' : clearConfirm ? 'Confirm Delete' : 'Clear Products'}
            </button>
          </div>

          {/* Export CSV */}
          <div className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-lg">
            <div>
              <p className="text-sm font-semibold text-gray-900">Export Products as CSV</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Download all products in a spreadsheet-compatible CSV file.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
