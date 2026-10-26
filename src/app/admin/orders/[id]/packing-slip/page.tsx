import { notFound } from 'next/navigation';
import { writeClient } from '@/lib/sanity/client';
import PrintButton from '@/components/admin/PrintButton';
import { orderRingSizeLabel } from '@/lib/ring-size';

type SlipOrder = { razorpayOrderId: string; status: string; fulfillmentBlocked?: boolean;
  customer: { name: string; address: string; phone: string };
  items: { productId: string; name: string; quantity: number; category?: string; ringSize?: number }[]; courier?: string; trackingNumber?: string };

export default async function PackingSlip({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await writeClient.fetch<SlipOrder | null>('*[_type == "order" && _id == $id][0]', { id }, { cache: 'no-store' });
  if (!order) notFound();
  return <div className="mx-auto max-w-3xl bg-white p-8 text-gray-900 print:p-0">
    <PrintButton />
    <header className="border-b border-gray-300 pb-5"><h1 className="font-serif text-3xl">Surya Jewellers</h1><p className="mt-2 text-sm">B-169 Anandpuri, Moti Doongri Road, Jaipur 302004, India</p><p className="text-sm">+91 99839 39306</p></header>
    <h2 className="mt-6 text-xl">Packing slip</h2><p className="mt-2 break-all text-sm">Order: SJ-{order.razorpayOrderId}</p>
    {(!['paid', 'confirmed', 'shipped', 'delivered'].includes(order.status) || order.fulfillmentBlocked) && <p className="my-4 border-2 border-red-700 p-3 font-bold text-red-700">DO NOT DISPATCH - ORDER REQUIRES REVIEW</p>}
    <section className="my-6"><h3 className="text-xs uppercase">Deliver to</h3><p className="mt-2 font-semibold">{order.customer.name}</p><p className="max-w-md whitespace-pre-line text-sm">{order.customer.address}</p><p className="mt-2 text-sm">{order.customer.phone || 'Contact number not provided'}</p></section>
    <table className="w-full text-left text-sm"><thead><tr className="border-b border-gray-300"><th className="py-3">Item</th><th className="py-3 text-right">Quantity</th></tr></thead><tbody>{order.items.map((item, index) => <tr key={index} className="border-b border-gray-200"><td className="py-3">{item.name}{orderRingSizeLabel(item) && <p className="mt-1 text-xs">{orderRingSizeLabel(item)}</p>}</td><td className="py-3 text-right">{item.quantity}</td></tr>)}</tbody></table>
    {order.trackingNumber && <p className="mt-6 text-sm">{order.courier}: {order.trackingNumber}</p>}
  </div>;
}
