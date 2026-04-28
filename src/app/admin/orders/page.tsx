'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: OrderItem[];
  subtotal: number;
  discount?: { name: string; percent: number; amount: number; subtotalBeforeDiscount: number } | null;
  shipping: number;
  total: number;
  status: string;
  paidAt: string;
}

const STATUS_OPTIONS = ['paid', 'confirmed', 'shipped', 'delivered', 'pending', 'failed', 'cancelled'];

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-teal-50 text-teal-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const fmt = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          All confirmed payments · {orders.length} total
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900">No orders yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Orders will appear here after a successful Razorpay payment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer?.name || '—'}
                        </p>
                        <p className="text-xs text-gray-500">{order.customer?.email}</p>
                        <p className="text-xs text-gray-400">{order.customer?.phone}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-700 max-w-[180px] truncate">
                          {order.items?.length === 1
                            ? order.items[0].name
                            : `${order.items?.length || 0} items`}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-900">
                          {fmt(order.total || 0)}
                        </p>
                        {order.shipping === 0 && (
                          <p className="text-xs text-green-600">Free shipping</p>
                        )}
                        {order.discount?.amount ? (
                          <p className="text-xs text-green-600">{order.discount.name}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {order.paidAt ? formatDate(order.paidAt) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={order.status || 'paid'}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 ${
                            STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() =>
                            setExpanded(expanded === order._id ? null : order._id)
                          }
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Toggle details"
                        >
                          {expanded === order._id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {expanded === order._id && (
                      <tr className="bg-gray-50/70">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                            {/* Items */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Items Purchased
                              </p>
                              <div className="space-y-1.5">
                                {order.items?.map((item, i) => (
                                  <div key={i} className="flex justify-between text-gray-700">
                                    <span>
                                      {item.name}
                                      {item.quantity > 1 && (
                                        <span className="text-gray-400 ml-1">×{item.quantity}</span>
                                      )}
                                    </span>
                                    <span className="font-medium">{fmt(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                                <div className="flex justify-between text-gray-500 text-xs pt-1 border-t border-gray-200 mt-1">
                                  <span>Subtotal</span>
                                  <span>{fmt(order.subtotal || 0)}</span>
                                </div>
                                {order.discount?.amount ? (
                                  <div className="flex justify-between text-green-700 text-xs">
                                    <span>{order.discount.name} ({order.discount.percent}% off)</span>
                                    <span>-{fmt(order.discount.amount)}</span>
                                  </div>
                                ) : null}
                                <div className="flex justify-between text-gray-500 text-xs">
                                  <span>Shipping</span>
                                  <span>{order.shipping === 0 ? 'Free' : fmt(order.shipping)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-gray-900 pt-0.5">
                                  <span>Total</span>
                                  <span>{fmt(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Address + IDs */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Shipping Address
                              </p>
                              <p className="text-gray-700 whitespace-pre-line text-sm">
                                {order.customer?.address || '—'}
                              </p>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 mb-1">
                                Razorpay IDs
                              </p>
                              <p className="text-xs font-mono text-gray-500 break-all">
                                Order: {order.razorpayOrderId || '—'}
                              </p>
                              <p className="text-xs font-mono text-gray-500 break-all">
                                Payment: {order.razorpayPaymentId || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
