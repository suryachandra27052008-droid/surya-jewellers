'use client';
import { orderRingSizeLabel } from '@/lib/ring-size';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, RefreshCw, Search } from 'lucide-react';
import OrderFulfillment from '@/components/admin/OrderFulfillment';
import { orderNeedsAttention } from '@/lib/order-tools';

interface OrderItem {
  ringSize?: number;
  category?: string;
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
  _createdAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentPendingReason?: string;
  paymentCurrency?: string;
  paymentAmount?: string;
  needsMerchantReview?: boolean;
  fulfillmentBlocked?: boolean;
  processingError?: string;
  notificationError?: string;
  orderConfirmationSentAt?: string;
  courier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  internalNotes?: string;
}

const STATUS_OPTIONS = ['paid', 'confirmed', 'shipped', 'delivered', 'pending', 'failed', 'cancelled', 'expired'];

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
  const [paymentMessage, setPaymentMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [reconciling, setReconciling] = useState(false);
  const [integrations, setIntegrations] = useState<{ paypalWebhook: boolean; razorpayWebhook: boolean } | null>(null);
  const reloadOrders = async () => {
    const response = await fetch('/api/admin/orders', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load orders.');
    const result = await response.json(); setOrders(result.orders || []); setIntegrations(result.integrations || null);
  };
  const retryOrders = async () => {
    setReconciling(true); setPaymentMessage('');
    try {
      const response = await fetch('/api/admin/reconcile-orders', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not retry order updates.');
      await reloadOrders(); setPaymentMessage(`${result.checked} orders checked; ${result.failed} need further attention.`);
    } catch (error) { setPaymentMessage((error as Error).message); } finally { setReconciling(false); }
  };
  const visibleOrders = orders.filter(order => {
    const matches = [order.customer?.name, order.customer?.email, order.razorpayOrderId, order.razorpayPaymentId,
      ...order.items?.map(item => item.name) || []].join(' ').toLowerCase().includes(search.trim().toLowerCase());
    return matches && (filter === 'all' || (filter === 'attention' ? orderNeedsAttention(order) : order.status === filter));
  });

  const refreshPayPal = async (order: Order) => {
    setUpdatingId(order._id);
    setPaymentMessage('');
    try {
      const response = await fetch('/api/admin/paypal-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.razorpayOrderId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to refresh payment status.');
      const ordersResponse = await fetch('/api/admin/orders');
      if (!ordersResponse.ok) throw new Error('Unable to refresh orders.');
      const data = await ordersResponse.json();
      setOrders(data.orders || []);
      setPaymentMessage(result.pending ? 'PayPal still reports this payment as pending.' : 'PayPal payment status refreshed.');
    } catch (error) {
      setPaymentMessage((error as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders || []); setIntegrations(data.integrations || null); })
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
        const result = await res.json();
        if (result.emailWarning) setPaymentMessage(result.emailWarning);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      } else { setPaymentMessage((await res.json()).error || 'Order could not be updated.'); }
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
          Orders and pending payments · {orders.length} total
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input aria-label="Search orders" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search orders or customers" className="w-full min-w-[180px] rounded border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm" /></div>
        <select aria-label="Filter orders" value={filter} onChange={event => setFilter(event.target.value)} className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"><option value="all">All orders</option><option value="attention">Needs attention</option>{STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}</select>
        <button onClick={retryOrders} disabled={reconciling} className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50"><RefreshCw size={15} />{reconciling ? 'Checking...' : 'Retry order updates'}</button>
      </div>
      {integrations && (!integrations.paypalWebhook || !integrations.razorpayWebhook) && <p role="status" className="text-xs text-amber-800">Payment webhook activation is incomplete. {!integrations.paypalWebhook && 'PayPal is not configured. '}{!integrations.razorpayWebhook && 'Razorpay is not configured.'}</p>}

      <div className="bg-white rounded-xl border border-gray-200">
        {paymentMessage && <p role="status" className="px-5 py-3 text-sm text-gray-700">{paymentMessage}</p>}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900">No orders yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Orders and pending PayPal checkouts will appear here.
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
                {visibleOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">
                          {order.customer?.name || '—'}
                        </p>
                        <p className="text-xs text-gray-500">{order.customer?.email}</p>
                        <p className="text-xs text-gray-400">{order.customer?.phone}</p>
                        {order.needsMerchantReview && <p className="text-xs text-amber-800">Contact/shipping details need review</p>}
                        {order.fulfillmentBlocked && <p className="text-xs font-semibold text-red-700">Do not dispatch - stock review required</p>}
                        {order.processingError && <p className="text-xs text-red-700">{order.processingError}</p>}
                        {order.notificationError && <p className="text-xs text-amber-800">Confirmation email needs attention</p>}
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
                          {order.paidAt || order._createdAt ? formatDate(order.paidAt || order._createdAt!) : '—'}
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
                                      {orderRingSizeLabel(item) && <span className={`mt-0.5 block text-xs ${item.ringSize === undefined ? 'text-amber-800' : 'text-gray-600'}`}>{orderRingSizeLabel(item)}</span>}
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
                                {order.paymentMethod === 'paypal' ? 'PayPal Payment' : 'Razorpay IDs'}
                              </p>
                              {order.paymentMethod === 'paypal' && (
                                <p className="text-xs text-gray-600 mb-2">
                                  {order.paymentCurrency} {order.paymentAmount} · {order.paymentStatus || order.status}
                                  {order.paymentPendingReason ? ` · ${order.paymentPendingReason.replaceAll('_', ' ')}` : ''}
                                </p>
                              )}
                              {order.paymentMethod === 'paypal' && order.status === 'pending' && (
                                <button
                                  type="button" onClick={() => refreshPayPal(order)}
                                  disabled={updatingId === order._id}
                                  className="inline-flex items-center gap-2 text-sm text-amber-800 disabled:opacity-50 mb-2"
                                >
                                  <RefreshCw className="w-4 h-4" /> Refresh PayPal Status
                                </button>
                              )}
                              <p className="text-xs font-mono text-gray-500 break-all">
                                Order: {order.razorpayOrderId || '—'}
                              </p>
                              <p className="text-xs font-mono text-gray-500 break-all">
                                Payment: {order.razorpayPaymentId || '—'}
                              </p>
                            </div>
                          </div>
                          <OrderFulfillment key={order._id} order={order} onSaved={() => { void reloadOrders().catch(() => setPaymentMessage('Could not reload orders.')); }} />
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
