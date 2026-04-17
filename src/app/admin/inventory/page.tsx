'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Upload,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  mainStoneType: string;
  silverWeight: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  emoji: string;
}

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



export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  // Bulk upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkParsing, setBulkParsing] = useState(false);
  const [bulkProducts, setBulkProducts] = useState<ParsedProduct[]>([]);
  const [bulkConfirming, setBulkConfirming] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const handleBulkParse = async () => {
    if (!bulkFile) return;
    setBulkParsing(true);
    setBulkError(null);
    setBulkProducts([]);
    setBulkSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', bulkFile);
      const res = await fetch('/api/upload-products', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      setBulkProducts(data.products);
    } catch (err: any) {
      setBulkError(err.message || 'Failed to parse Excel file');
    } finally {
      setBulkParsing(false);
    }
  };

  const handleBulkConfirm = async () => {
    setBulkConfirming(true);
    setBulkError(null);
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: bulkProducts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setBulkSuccess(true);
      setBulkProducts([]);
      setBulkFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Refresh product list
      const productsRes = await fetch('/api/admin/products');
      if (productsRes.ok) {
        const pData = await productsRes.json();
        const mapped = pData.products.map((p: any) => ({
          _id: p._id,
          name: p.name,
          sku: p.sku,
          price: p.price,
          category: p.category,
          mainStoneType: p.mainStoneType || 'None',
          silverWeight: p.silverWeight || 0,
          status: p.inStock ? 'In Stock' : 'Sold Out',
          emoji: '🆕',
        }));
        setProducts(mapped.reverse());
      }
    } catch (err: any) {
      setBulkError(err.message || 'Failed to upload products');
    } finally {
      setBulkConfirming(false);
    }
  };
  
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          // Map API products to match local Product interface
          const apiProducts = data.products.map((p: any) => ({
            _id: p._id,
            name: p.name,
            sku: p.sku,
            price: p.price,
            category: p.category,
            mainStoneType: p.mainStoneType || 'None',
            silverWeight: p.silverWeight || 0,
            status: p.inStock ? 'In Stock' : 'Sold Out',
            emoji: '🆕'
          }));
          // API products listed first
          setProducts(apiProducts.reverse());
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
    loadProducts();
  }, []);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'price' | 'sku'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const perPage = 8;

  // Filter + Search + Sort
  const filtered = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        filterCategory === 'All' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortDir === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (field: 'name' | 'price' | 'sku') => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Basic ' + btoa('admin:Good@luck123'),
        },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete product from database');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error. Failed to delete product.');
    } finally {
      setDeleteModal(null);
    }
  };

  const statusStyles: Record<string, string> = {
    'In Stock': 'bg-emerald-50 text-emerald-700',
    'Low Stock': 'bg-amber-50 text-amber-700',
    'Sold Out': 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} products in your catalog
          </p>
        </div>
        <Link
          href="/admin/add-product"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Bulk Upload via Excel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900">Bulk Upload via Excel</h2>
          <span className="text-xs text-gray-400 ml-1">(first 5 products)</span>
        </div>

        {bulkSuccess ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-700">
              5 products uploaded successfully! Inventory list refreshed.
            </p>
            <button
              onClick={() => setBulkSuccess(false)}
              className="ml-auto text-xs text-emerald-600 hover:underline"
            >
              Upload more
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => {
                  setBulkFile(e.target.files?.[0] || null);
                  setBulkProducts([]);
                  setBulkError(null);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-gray-50 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {bulkFile ? bulkFile.name : 'Choose .xlsx file'}
              </button>

              <button
                onClick={handleBulkParse}
                disabled={!bulkFile || bulkParsing}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {bulkParsing ? 'Parsing...' : 'Parse Excel'}
              </button>
            </div>

            {bulkError && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 border border-red-100">
                {bulkError}
              </p>
            )}

            {bulkProducts.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Preview — {bulkProducts.length} products found
                </p>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-medium">Image</th>
                        <th className="px-4 py-2.5 text-left font-medium">SKU</th>
                        <th className="px-4 py-2.5 text-left font-medium">Name</th>
                        <th className="px-4 py-2.5 text-left font-medium">Stone</th>
                        <th className="px-4 py-2.5 text-left font-medium">Category</th>
                        <th className="px-4 py-2.5 text-left font-medium">Price (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bulkProducts.map((p) => (
                        <tr key={p.index} className="bg-white">
                          <td className="px-4 py-2.5">
                            {p.imageBase64 ? (
                              <img
                                src={p.imageBase64}
                                alt={p.name}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                                No img
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-gray-600">{p.sku || '—'}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-900">{p.name}</td>
                          <td className="px-4 py-2.5 text-gray-600">{p.stoneName || '—'}</td>
                          <td className="px-4 py-2.5 text-gray-600">{p.category}</td>
                          <td className="px-4 py-2.5 font-semibold text-gray-900">
                            {p.price ? `₹${p.price.toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleBulkConfirm}
                    disabled={bulkConfirming}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {bulkConfirming ? 'Uploading to Sanity...' : 'Confirm Upload'}
                  </button>
                  <button
                    onClick={() => { setBulkProducts([]); setBulkFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none"
          >
            <option value="All">All Categories</option>
            <option value="Rings">Rings</option>
            <option value="Necklaces">Necklaces</option>
            <option value="Earrings">Earrings</option>
            <option value="Bracelets">Bracelets</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50/60 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Image</th>
                <th className="px-6 py-3 font-medium">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-800 transition-colors"
                  >
                    Product Name
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-3 font-medium">
                  <button
                    onClick={() => handleSort('sku')}
                    className="flex items-center gap-1 hover:text-gray-800 transition-colors"
                  >
                    SKU
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-1 hover:text-gray-800 transition-colors"
                  >
                    Price
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Thumbnail */}
                  <td className="px-6 py-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm border border-gray-200">
                      {product.emoji}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-6 py-3">
                    <span className="text-sm font-medium text-gray-900">
                      {product.name}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.silverWeight}g • {product.mainStoneType || '-'}
                    </p>
                  </td>

                  {/* SKU */}
                  <td className="px-6 py-3">
                    <span className="text-sm text-gray-500 font-mono">
                      {product.sku}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-3">
                    <span className="text-sm text-gray-600">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-3">
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusStyles[product.status]
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/edit-product/${product._id}`}
                        className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteModal(product._id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">
                      No products found matching your criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * perPage + 1}–
              {Math.min(page * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    page === i + 1
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDeleteModal(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm w-full">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Delete Product
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove this product from your inventory?
              This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
