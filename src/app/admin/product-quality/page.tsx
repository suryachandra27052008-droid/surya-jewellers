'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Pencil, RefreshCw, Search } from 'lucide-react';
import { auditProductQuality, QUALITY_LABELS, type QualityProduct, type QualityIssueKind } from '@/lib/product-quality';

export default function ProductQualityPage() {
  const [products, setProducts] = useState<QualityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedAt, setCheckedAt] = useState('');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<QualityIssueKind | 'all'>('all');
  const [severity, setSeverity] = useState('all');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/products', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error(response.status === 401 ? 'Please sign in to admin again.' : 'Unable to load product data.');
      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error('Unexpected catalogue response.');
      return data.products as QualityProduct[];
    }).then(data => {
      if (!controller.signal.aborted) { setProducts(data); setCheckedAt(new Date().toLocaleString()); }
    }).catch(cause => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load product data.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  const report = useMemo(() => auditProductQuality(products), [products]);
  const criticalCount = report.filter(row => row.issues.some(issue => issue.severity === 'critical')).length;
  const rows = report.filter(({ product, issues }) => {
    const text = `${product.name || ''} ${product.sku ?? ''}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && issues.some(issue =>
      (kind === 'all' || issue.kind === kind) && (severity === 'all' || issue.severity === severity));
  });

  return <div className="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:p-8">
    <header className="mb-6 flex items-start justify-between gap-4">
      <div><h1 className="text-2xl font-semibold text-gray-900">Product Quality</h1>
        {checkedAt && <p className="mt-1 text-xs text-gray-500">Checked {checkedAt}</p>}</div>
      <button type="button" onClick={() => { setLoading(true); setError(''); setRevision(value => value + 1); }} disabled={loading} title="Refresh quality report" aria-label="Refresh quality report"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-gray-600 hover:border-amber-500 disabled:opacity-40">
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
    </header>
    <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-gray-200 py-5 sm:grid-cols-4">
      {[['Products checked', products.length], ['Need review', report.length], ['Critical products', criticalCount], ['No flags', products.length - report.length]].map(([label, count]) =>
        <div key={label}><dt className="text-xs text-gray-500">{label}</dt><dd className="mt-1 text-2xl font-semibold text-gray-900">{loading ? '-' : count}</dd></div>)}
    </dl>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
      <div className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
        <input type="search" value={query} onChange={event => setQuery(event.target.value.slice(0, 100))} aria-label="Search product quality by name or SKU"
          placeholder="Product name or SKU" className="h-11 w-full rounded border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900" /></div>
      <select value={kind} onChange={event => setKind(event.target.value as typeof kind)} aria-label="Issue type" className="h-11 rounded border border-gray-200 bg-white px-3 text-sm text-gray-700">
        <option value="all">All issues</option>{Object.entries(QUALITY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <select value={severity} onChange={event => setSeverity(event.target.value)} aria-label="Issue severity" className="h-11 rounded border border-gray-200 bg-white px-3 text-sm text-gray-700">
        <option value="all">All severities</option><option value="critical">Critical</option><option value="warning">Warnings</option>
      </select>
    </div>
    {error && <p role="alert" className="mb-5 border-l-2 border-red-600 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {loading ? <p role="status" className="py-12 text-center text-sm text-gray-500">Checking products...</p>
      : !rows.length ? <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-600"><CheckCircle2 size={18} />{report.length ? 'No matching issues.' : error ? 'Report unavailable.' : 'No product issues found.'}</div>
      : <div className="overflow-x-auto border-y border-gray-200 bg-white">
        <table className="w-full min-w-[650px] text-left text-sm"><caption className="sr-only">Product quality issues</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500"><tr>
            <th className="p-3 font-medium">Product / SKU</th><th className="p-3 font-medium">Source Price (INR)</th><th className="p-3 font-medium">Issues</th><th className="p-3 font-medium">Edit</th>
          </tr></thead>
          <tbody>{rows.map(({ product, issues }) => <tr key={product._id} className="border-b border-gray-100 align-top last:border-0">
            <td className="max-w-[240px] p-3"><p className="break-words font-medium text-gray-900">{product.name || 'Unnamed product'}</p>
              <p className="mt-1 text-xs text-gray-500">SKU {product.sku ?? '-'}</p></td>
            <td className="whitespace-nowrap p-3 text-gray-700">{typeof product.price === 'number' && Number.isFinite(product.price) ? product.price.toLocaleString('en-IN') : 'Missing / invalid'}</td>
            <td className="min-w-[280px] max-w-lg p-3"><ul className="space-y-2">{issues.map((issue, index) => <li key={`${issue.kind}-${index}`} className="flex items-start gap-2 text-xs leading-5">
              <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${issue.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
              <span className="break-words text-gray-700"><strong className={issue.severity === 'critical' ? 'text-red-700' : 'text-amber-800'}>{QUALITY_LABELS[issue.kind]}: </strong>{issue.message}</span>
            </li>)}</ul></td>
            <td className="p-3"><Link href={`/admin/edit-product/${encodeURIComponent(product._id)}`} title={`Edit ${product.name || product.sku || 'product'}`} aria-label={`Edit ${product.name || product.sku || 'product'}`}
              className="flex h-11 w-11 items-center justify-center rounded border border-gray-200 text-gray-600 hover:border-amber-500"><Pencil size={16} /></Link></td>
          </tr>)}</tbody>
        </table>
      </div>}
    {!loading && rows.length > 0 && <p role="status" className="mt-3 text-xs text-gray-500">{rows.length} products</p>}
  </div>;
}
