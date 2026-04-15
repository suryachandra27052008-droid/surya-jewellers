'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  customer: { name: string; email: string };
  items: OrderItem[];
  total: number;
  status: string;
  paidAt: string;
}

type Period = '7d' | '30d' | '12m';

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function fmtFull(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Simple SVG bar chart
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.max(8, Math.floor(560 / data.length) - 4);
  const chartH = 140;
  const chartW = 580;

  if (data.every((d) => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No revenue data for this period
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <svg width={chartW} height={chartH + 32} className="block min-w-full">
        {data.map((d, i) => {
          const barH = Math.max(2, (d.value / max) * chartH);
          const x = i * (barWidth + 4) + 2;
          const y = chartH - barH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={3}
                className="fill-amber-400 hover:fill-amber-500 transition-colors cursor-default"
              >
                <title>{d.label}: {fmtFull(d.value)}</title>
              </rect>
              {data.length <= 14 && (
                <text
                  x={x + barWidth / 2}
                  y={chartH + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#9ca3af"
                >
                  {d.label}
                </text>
              )}
              {data.length > 14 && i % Math.ceil(data.length / 10) === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={chartH + 16}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#9ca3af"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
        {/* Y-axis max label */}
        <text x={0} y={10} fontSize={9} fill="#9ca3af">{fmt(max)}</text>
      </svg>
    </div>
  );
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('30d');

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // ── Stats ──────────────────────────────────────────
  const totalRevenue = useMemo(
    () => orders.reduce((s, o) => s + (o.total || 0), 0),
    [orders]
  );
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const thisMonthRevenue = useMemo(() => {
    const now = new Date();
    return orders
      .filter((o) => {
        const d = new Date(o.paidAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, o) => s + (o.total || 0), 0);
  }, [orders]);

  // ── Chart data ─────────────────────────────────────
  const chartData = useMemo(() => {
    const now = new Date();

    if (period === '7d') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        const value = orders
          .filter((o) => o.paidAt?.slice(0, 10) === key)
          .reduce((s, o) => s + (o.total || 0), 0);
        return {
          label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          value,
        };
      });
    }

    if (period === '30d') {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (29 - i));
        const key = d.toISOString().slice(0, 10);
        const value = orders
          .filter((o) => o.paidAt?.slice(0, 10) === key)
          .reduce((s, o) => s + (o.total || 0), 0);
        return {
          label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          value,
        };
      });
    }

    // 12m — monthly
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const value = orders
        .filter((o) => {
          const od = new Date(o.paidAt);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        })
        .reduce((s, o) => s + (o.total || 0), 0);
      return {
        label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        value,
      };
    });
  }, [orders, period]);

  // ── Best sellers ────────────────────────────────────
  const bestSellers = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; count: number }> = {};
    orders.forEach((o) => {
      o.items?.forEach((item) => {
        const key = item.productId || item.name;
        if (!map[key]) map[key] = { name: item.name, revenue: 0, count: 0 };
        map[key].revenue += item.price * item.quantity;
        map[key].count += item.quantity;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  // ── Recent orders ───────────────────────────────────
  const recentOrders = orders.slice(0, 8);

  const stats = [
    {
      label: 'Total Revenue',
      value: fmtFull(totalRevenue),
      sub: 'All time',
      icon: DollarSign,
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Total Orders',
      value: totalOrders.toString(),
      sub: 'Confirmed payments',
      icon: ShoppingBag,
      color: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Avg. Order Value',
      value: totalOrders > 0 ? fmtFull(avgOrderValue) : '—',
      sub: 'Per order',
      icon: TrendingUp,
      color: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      label: 'This Month',
      value: fmtFull(thisMonthRevenue),
      sub: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      icon: Package,
      color: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Store performance and sales overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Revenue Over Time</h2>
          <div className="flex gap-1">
            {(['7d', '30d', '12m'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  period === p
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '12 Months'}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={chartData} />
      </div>

      {/* Bottom row: best sellers + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best sellers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Products by Revenue</h2>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.count} {p.count === 1 ? 'piece' : 'pieces'} sold
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {fmtFull(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {o.customer?.name || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {o.items?.length === 1
                        ? o.items[0].name
                        : `${o.items?.length || 0} items`}{' '}
                      · {o.paidAt ? formatDate(o.paidAt) : '—'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {fmtFull(o.total || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
