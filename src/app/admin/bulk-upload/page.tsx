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
  barcode: string;
  category: string;
  stones: string[];
  stoneName: string;
  silverWeight: number;
  diamondWeight: number;
  pearlWeight?: number;
  csWeight: number;
  grossWeight?: number;
  price: number;
  name: string;
  imagePath: string;
  imageBase64: string;
}

interface CellDebug {
  ref: string;
  type: string;
  rawVal: string;
  resolved: string;
}

interface DebugInfo {
  sharedStringsTotal: number;
  first30SharedStrings: string[];
  detectedHeaderRow: number;
  detectedColumns: Record<string, string>;
  row1Cells: CellDebug[];
  row2Cells: CellDebug[];
  row3Cells: CellDebug[];
}

export default function BulkUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
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
      if (data.debugInfo) setDebugInfo(data.debugInfo);
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
    setDebugInfo(null);
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
          Import products from your Excel sheet — processes up to 10 data rows with embedded images
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
          <button onClick={() => setSuccess(false)} className="text-emerald-500 hover:text-emerald-700">
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
                Processing up to 10 products…
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
            <p className="text-xs font-medium text-gray-600 mb-2">Expected column layout (row 1 = header, data from row 2):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs text-gray-500">
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">B</span> Category (Ring, Earring, TOPS…)</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">D</span> SKU (shared string)</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">E</span> Barcode (number)</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">J</span> Silver Weight (g)</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">K</span> Diamond Weight (ct)</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">M</span> CS Weight</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">N</span> Stone Names (CORAL, EMRALD, RUBY…)</span>
              <span><span className="font-mono bg-white border border-gray-200 px-1 rounded">O</span> Price (₹)</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Row 1 = header. Row 2 = first product (image1.jpeg), row 3 = second (image2.jpeg), etc. Up to 10 products processed.
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

      {/* Debug panel */}
      {debugInfo && (
        <details className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
          <summary className="px-5 py-3 cursor-pointer text-sm font-mono text-green-400 hover:text-green-300 select-none flex items-center gap-2">
            <span>🔍</span>
            <span>Parser Debug Info — click to expand</span>
            <span className="ml-auto text-gray-500 text-xs">
              {debugInfo.sharedStringsTotal} shared strings · header row {debugInfo.detectedHeaderRow} · {debugInfo.row2Cells.length} cells in row 2
            </span>
          </summary>
          <div className="px-5 pb-5 space-y-4 font-mono text-xs text-gray-300">
            {/* Detected columns */}
            <div>
              <p className="text-yellow-400 mb-1 mt-3">Auto-detected column mapping (header row {debugInfo.detectedHeaderRow}):</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(debugInfo.detectedColumns).map(([field, letter]) => (
                  <span key={field} className="px-2 py-0.5 rounded bg-gray-800 border border-gray-600">
                    <span className="text-cyan-400">{letter}</span>
                    <span className="text-gray-500 mx-1">→</span>
                    <span className="text-green-400">{field}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Shared strings */}
            <div>
              <p className="text-yellow-400 mb-1 mt-3">sharedStrings[0..29] — SKU/stone values are looked up here by index:</p>
              <div className="overflow-x-auto">
                <table className="border-collapse">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="border border-gray-700 px-2 py-1 text-left">idx</th>
                      <th className="border border-gray-700 px-2 py-1 text-left">value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debugInfo.first30SharedStrings.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-800">
                        <td className="border border-gray-700 px-2 py-0.5 text-green-500">{i}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-white">{s || <em className="text-gray-600">(empty)</em>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 1 (headers) */}
            <div>
              <p className="text-yellow-400 mb-1">Row 1 — header row:</p>
              <div className="overflow-x-auto">
                <table className="border-collapse">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="border border-gray-700 px-2 py-1">ref</th>
                      <th className="border border-gray-700 px-2 py-1">type</th>
                      <th className="border border-gray-700 px-2 py-1">rawVal</th>
                      <th className="border border-gray-700 px-2 py-1">resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debugInfo.row1Cells.map((c) => (
                      <tr key={c.ref} className="hover:bg-gray-800">
                        <td className="border border-gray-700 px-2 py-0.5 text-cyan-400">{c.ref}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-purple-400">{c.type}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-orange-300">{c.rawVal}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-white font-bold">{c.resolved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 2 (first data row) */}
            <div>
              <p className="text-yellow-400 mb-1">Row 2 — first data row (should contain EAR08923 etc):</p>
              <div className="overflow-x-auto">
                <table className="border-collapse">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="border border-gray-700 px-2 py-1">ref</th>
                      <th className="border border-gray-700 px-2 py-1">type</th>
                      <th className="border border-gray-700 px-2 py-1">rawVal</th>
                      <th className="border border-gray-700 px-2 py-1">resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debugInfo.row2Cells.map((c) => (
                      <tr key={c.ref} className={`hover:bg-gray-800 ${c.resolved.includes('EAR') || c.resolved.includes('PND') || c.resolved.includes('RNG') || c.resolved.includes('BR') ? 'bg-green-900/30' : ''}`}>
                        <td className="border border-gray-700 px-2 py-0.5 text-cyan-400">{c.ref}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-purple-400">{c.type}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-orange-300">{c.rawVal}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-white font-bold">{c.resolved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <p className="text-yellow-400 mb-1">Row 3 — second data row:</p>
              <div className="overflow-x-auto">
                <table className="border-collapse">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="border border-gray-700 px-2 py-1">ref</th>
                      <th className="border border-gray-700 px-2 py-1">type</th>
                      <th className="border border-gray-700 px-2 py-1">rawVal</th>
                      <th className="border border-gray-700 px-2 py-1">resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debugInfo.row3Cells.map((c) => (
                      <tr key={c.ref} className="hover:bg-gray-800">
                        <td className="border border-gray-700 px-2 py-0.5 text-cyan-400">{c.ref}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-purple-400">{c.type}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-orange-300">{c.rawVal}</td>
                        <td className="border border-gray-700 px-2 py-0.5 text-white font-bold">{c.resolved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </details>
      )}

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
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Product Name</th>
                  <th className="px-4 py-3 font-medium">Stones</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Barcode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      {p.imageBase64 ? (
                        <img
                          src={p.imageBase64}
                          alt={p.name}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300 text-xs">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-700 font-medium">{p.sku || '—'}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(() => {
                          const silverWt = parseFloat(String(p.silverWeight || 0));
                          const diaWt = parseFloat(String(p.diamondWeight || 0));
                          const csWt = parseFloat(String(p.csWeight || 0));
                          const parts: string[] = [];
                          if (silverWt > 0) parts.push(`${silverWt}g silver`);
                          if (diaWt > 0) parts.push(`${diaWt}ct diamond`);
                          if (csWt > 0) parts.push(`${csWt}ct colored stones`);
                          return parts.join(' · ') || '—';
                        })()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {p.stones && p.stones.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.stones.map((s) => (
                            <span
                              key={s}
                              className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-100"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{p.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {p.price ? `₹${p.price.toLocaleString('en-IN')}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-500">{p.barcode || '—'}</span>
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
