'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    {
      label: 'Total Products',
      value: products.length.toString(),
      change: 'Live focus',
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Total Revenue',
      value: '₹0',
      change: '0% this month',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Avg. Order Value',
      value: '₹0',
      change: '0% this month',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
      iconColor: 'text-amber-500',
    },
    {
      label: 'Low Stock Items',
      value: '0',
      change: 'All clear',
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      iconColor: 'text-red-500',
    },
  ];

  // Show up to 5 most recent products
  const recentProducts = products.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back. Here&apos;s your store overview.
          </p>
        </div>
        <Link
          href="/admin/add-product"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Products Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent Products
          </h2>
          <Link
            href="/admin/inventory"
            className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-50">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentProducts.map((product) => (
                <tr
                  key={product.sku}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs flex-shrink-0 text-gray-400">
                        🆕
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-gray-500 font-mono">
                      {product.sku}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-medium text-gray-900">
                      ₹{product.price?.toLocaleString('en-IN') || '0'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.inStock
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && recentProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-500">No products added yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
