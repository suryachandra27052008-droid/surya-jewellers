import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { sendOrderStatusEmail } from '@/lib/email';
import { isPaidOrder } from '@/lib/order-status';
import { safeTrackingUrl, orderNeedsAttention } from '@/lib/order-tools';
import { textField } from '@/lib/server/request-security';

interface AdminOrder {
  total?: number;
  status?: string;
  customer?: {
    email?: string;
  };
}

export async function GET() {
  try {
    const orders = await writeClient.fetch(
      `*[_type == "order"] | order(coalesce(paidAt, _createdAt) desc) {
        _id,
        razorpayOrderId,
        razorpayPaymentId,
        paymentMethod,
        paymentStatus,
        paymentPendingReason,
        paymentCurrency,
        paymentAmount,
        needsMerchantReview,
        fulfillmentBlocked,
        processingError,
        notificationError,
        orderConfirmationSentAt,
        courier,
        trackingNumber,
        trackingUrl,
        internalNotes,
        _rev,
        customer,
        items,
        subtotal,
        discount,
        shipping,
        total,
        status,
        paidAt,
        _createdAt
      }`,
      {},
      { cache: 'no-store' }
    );

    const paidOrders = (orders as AdminOrder[]).filter(isPaidOrder);
    const totalRevenue = paidOrders.reduce((sum: number, o) => sum + (o.total || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    return NextResponse.json({ orders, totalRevenue, avgOrderValue, count: orders.length, paidCount: paidOrders.length,
      attentionCount: orders.filter(orderNeedsAttention).length,
      integrations: { paypalWebhook: Boolean(process.env.PAYPAL_WEBHOOK_ID), razorpayWebhook: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET) },
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    const validStatuses = ['paid', 'confirmed', 'shipped', 'delivered', 'pending', 'failed', 'cancelled', 'expired'];
    if (typeof id !== 'string' || (status !== undefined && !validStatuses.includes(status))) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }

    const existing = await writeClient.fetch<AdminOrder & { _rev: string; courier?: string; trackingNumber?: string; fulfillmentBlocked?: boolean; checkoutVersion?: number } | null>(
      `*[_type == "order" && _id == $id][0]`, { id },
    );
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (status && ['paid', 'confirmed', 'shipped', 'delivered'].includes(status) &&
      (!isPaidOrder(existing) || existing.fulfillmentBlocked)) {
      return NextResponse.json({ error: 'Verify the payment and resolve stock alerts before confirming or dispatching.' }, { status: 409 });
    }
    const fields: Record<string, string> = {};
    if (status) fields.status = status;
    if (body.courier !== undefined) fields.courier = textField(body.courier, 80);
    if (body.trackingNumber !== undefined) fields.trackingNumber = textField(body.trackingNumber, 100);
    if (body.trackingUrl !== undefined) fields.trackingUrl = safeTrackingUrl(body.trackingUrl);
    if (body.internalNotes !== undefined) fields.internalNotes = textField(body.internalNotes, 3000);
    if (!Object.keys(fields).length) return NextResponse.json({ error: 'No changes supplied.' }, { status: 400 });
    if (status === 'shipped' && !(fields.courier || existing.courier) && !(fields.trackingNumber || existing.trackingNumber)) {
      return NextResponse.json({ error: 'Add the courier or tracking details before marking the parcel shipped.' }, { status: 400 });
    }

    await writeClient.patch(id).ifRevisionId(existing._rev).set(fields).commit();

    let emailWarning = '';
    // Send customer email for actionable status changes
    const emailStatuses = ['shipped', 'delivered', 'cancelled', 'failed'];
    if (emailStatuses.includes(status) && existing.status !== status) {
      try {
        const order = await writeClient.fetch(
          `*[_type == "order" && _id == $id][0]{
            _id,
            razorpayOrderId,
            customer,
            items,
            subtotal,
            discount,
            shipping,
            total
            ,courier, trackingNumber, trackingUrl
          }`,
          { id }
        );

        if (order?.customer?.email) {
          await sendOrderStatusEmail(order, status);
          console.log(`[orders] status email (${status}) sent to`, order.customer.email);
        }
      } catch (emailErr: unknown) {
        // Log but never fail the status update because of email errors
        console.error('[orders] status email error:', (emailErr as Error)?.message);
        emailWarning = 'The order was updated, but the customer status email could not be sent. Please contact support.';
      }
    }

    return NextResponse.json({ success: true, ...(emailWarning ? { emailWarning } : {}) });
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update order.' }, { status: 400 });
  }
}
