'use client';

import { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';

interface ParsedProduct {
  index: number;
  sku: string;
  category: string;
  stoneName: string;
  silverWeight: number;
  diamondWeight: number;
  price: number;
  name: string;
  imagePath: string;
  imageBase64: string;
}

export default function BulkUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setProducts([]);
    setError(null);
    setSuccess(false);
  };

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    setError(null);
    setProducts([]);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-products', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse file');
      setProducts(data.products);
    } catch (err: any) {
      setError(err.message || 'Could not read Excel file');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSuccessCount(data.created);
      setSuccess(true);
      setProducts([]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Could not save products');
    } finally {
      setConfirming(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setProducts([]);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Import products from your Excel sheet — processes the first 5 rows with embedded images
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">
              {successCount} product{successCount !== 1 ? 's' : ''} uploaded successfully!
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Products are now live in your inventory.
            </p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Select Excel File</h2>
            <p className="text-xs text-gray-400">Accepts .xlsx format only</p>
          </div>
        </div>

        {/* File picker row */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors min-w-[200px] justify-start"
          >
            <Upload className="w-4 h-4 text-gray-400" />
            <span className="truncate max-w-[220px]">
              {file ? file.name : 'Choose .xlsx file…'}
            </span>
          </button>

          <button
            onClick={handleParse}
            disabled={!file || parsing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {parsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing first 5 products…
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                Parse Excel
              </>
            )}
          </button>

          {(file || products.length > 0) && !parsing && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Column guide */}
        {!file && (
          <div className="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-2">Expected column layout:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs text-gray-500">
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">D</span> SKU</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">B</span> Category (Ring, Necklace…)</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">AD</span> Stone Name</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">M</span> Silver Weight (g)</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">R</span> Diamond Weight (ct)</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">AI</span> Price (₹)</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Rows 1–2 are treated as headers. Products start from row 3.
              Embedded images (xl/media/image1.jpeg…) are extracted automatically.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Preview table */}
      {products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Preview</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {products.length} product{products.length !== 1 ? 's' : ''} ready to upload
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-100">
              Review before confirming
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50/60 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Image</th>
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">Product Name</th>
                  <th className="px-6 py-3 font-medium">Stone</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      {p.imageBase64 ? (
                        <img
                          src={p.imageBase64}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-mono text-gray-500">{p.sku || '—'}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.silverWeight ? `${p.silverWeight}g silver` : ''}
                        {p.silverWeight && p.diamondWeight ? ' · ' : ''}
                        {p.diamondWeight ? `${p.diamondWeight}ct diamond` : ''}
                      </p>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-gray-600">{p.stoneName || '—'}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-gray-600">{p.category}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {p.price ? `₹${p.price.toLocaleString('en-IN')}` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirm row */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center gap-3">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {confirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading to Sanity…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Upload
                </>
              )}
            </button>
            <button
              onClick={() => setProducts([])}
              disabled={confirming}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 transition-colors"
            >
              Cancel
            </button>
            <p className="text-xs text-gray-400 ml-auto hidden sm:block">
              Images will be saved to Sanity · Products go live immediately
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
