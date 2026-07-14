import { Resend } from 'resend';
import { escapeHtml } from '@/lib/server/request-security';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Surya Jewellers <hello@suryajewellers.com>';
const SUPPORT_EMAIL = 'suryajewellersjaipur@gmail.com';
const SUPPORT_PHONE = '+91 99839 39306';

// ─── Shared HTML helpers ────────────────────────────────────────────────────

function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0c0c07;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c07;min-height:100vh;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141410;border:1px solid #2c2810;">

      <!-- Gold top bar -->
      <tr><td style="background:linear-gradient(90deg,#8a6e1a,#d4af37,#e8c84a,#d4af37,#8a6e1a);height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>

      <!-- Logo header -->
      <tr><td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid #2a2510;">
        <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:26px;letter-spacing:10px;color:#d4af37;font-weight:normal;">SURYA</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:9px;letter-spacing:6px;color:#7a6a3a;text-transform:uppercase;">Jewellers &nbsp;·&nbsp; Jaipur</p>
      </td></tr>

      ${body}

      <!-- Footer -->
      <tr><td style="padding:28px 40px;border-top:1px solid #2a2510;text-align:center;">
        <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:12px;color:#6a5c2e;letter-spacing:1px;">Surya Jewellers, Jaipur — Handcrafted 92.5 Sterling Silver</p>
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#5a4e24;">
          <a href="mailto:${SUPPORT_EMAIL}" style="color:#d4af37;text-decoration:none;">${SUPPORT_EMAIL}</a>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <span style="color:#5a4e24;">${SUPPORT_PHONE}</span>
        </p>
        <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#3a3218;">
          © ${new Date().getFullYear()} Surya Jewellers. All rights reserved.
        </p>
      </td></tr>

      <!-- Gold bottom bar -->
      <tr><td style="background:linear-gradient(90deg,#8a6e1a,#d4af37,#e8c84a,#d4af37,#8a6e1a);height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function itemsTable(items: Array<{ name: string; price: number; quantity: number; image?: string }>): string {
  const rows = items.map((item) => {
    const safeName = escapeHtml(item.name);
    const safeImage = escapeHtml(item.image || '');
    return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #2a2510;vertical-align:middle;">
        ${item.image
          ? `<img src="${safeImage}" alt="${safeName}" width="48" height="48" style="border-radius:4px;object-fit:cover;border:1px solid #3a3010;vertical-align:middle;margin-right:12px;">`
          : `<span style="display:inline-block;width:48px;height:48px;background:#1e1c0a;border:1px solid #3a3010;border-radius:4px;margin-right:12px;vertical-align:middle;text-align:center;line-height:48px;font-size:20px;">✦</span>`
        }
        <span style="font-family:Georgia,serif;font-size:14px;color:#e0d4b0;vertical-align:middle;">${safeName}</span>
        ${item.quantity > 1 ? `<span style="font-family:Arial,sans-serif;font-size:12px;color:#7a6a3a;margin-left:6px;">×${item.quantity}</span>` : ''}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #2a2510;text-align:right;vertical-align:middle;font-family:Georgia,serif;font-size:14px;color:#d4af37;white-space:nowrap;">
        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>`;
  }).join('');
  return rows;
}

// ─── Order Confirmation ──────────────────────────────────────────────────────

interface OrderEmailData {
  orderId: string;
  paymentId: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: Array<{ name: string; price: number; quantity: number; image?: string }>;
  subtotal: number;
  discount?: { name: string; percent: number; amount: number; subtotalBeforeDiscount: number } | null;
  shipping: number;
  total: number;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const { orderId, customer, items, subtotal, discount, shipping, total } = data;
  const safeCustomer = {
    name: escapeHtml(customer.name),
    phone: escapeHtml(customer.phone),
    address: escapeHtml(customer.address),
  };
  const safeOrderId = escapeHtml(orderId);

  const body = `
    <!-- Hero -->
    <tr><td style="padding:40px 40px 24px;text-align:center;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;color:#d4af37;text-transform:uppercase;">Order Confirmed</p>
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:28px;color:#f0ead8;font-weight:normal;line-height:1.3;">Your order is confirmed ✦</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#9a8c6a;line-height:1.7;">
        Thank you, ${safeCustomer.name.split(' ')[0]}. Your piece is being crafted and prepared with care<br>
        at our workshop in Jaipur.
      </p>
    </td></tr>

    <!-- Order ref -->
    <tr><td style="padding:0 40px 24px;">
      <div style="background:#1a1810;border:1px solid #2c2810;border-radius:6px;padding:16px 20px;text-align:center;">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#7a6a3a;text-transform:uppercase;">Order Reference</p>
        <p style="margin:0;font-family:'Courier New',monospace;font-size:13px;color:#d4af37;letter-spacing:1px;">${safeOrderId}</p>
      </div>
    </td></tr>

    <!-- Items -->
    <tr><td style="padding:0 40px 24px;">
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#7a6a3a;text-transform:uppercase;">Items Ordered</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemsTable(items)}
        <tr>
          <td style="padding:10px 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#7a6a3a;">Subtotal</td>
          <td style="padding:10px 0 4px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#9a8c6a;">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
        ${discount && discount.amount > 0 ? `
        <tr>
          <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;color:#4caf50;">${escapeHtml(discount.name)} (${discount.percent}% off)</td>
          <td style="padding:4px 0;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#4caf50;">-â‚¹${discount.amount.toLocaleString('en-IN')}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:12px;color:#7a6a3a;">Shipping</td>
          <td style="padding:4px 0;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:${shipping === 0 ? '#4caf50' : '#9a8c6a'};">${shipping === 0 ? 'Free' : '₹' + shipping.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding:12px 0 0;border-top:1px solid #2a2510;font-family:Georgia,serif;font-size:16px;color:#f0ead8;">Total Paid</td>
          <td style="padding:12px 0 0;border-top:1px solid #2a2510;text-align:right;font-family:Georgia,serif;font-size:18px;color:#d4af37;font-weight:bold;">₹${total.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </td></tr>

    <!-- Address -->
    <tr><td style="padding:0 40px 32px;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#7a6a3a;text-transform:uppercase;">Delivery Address</p>
      <div style="background:#1a1810;border:1px solid #2c2810;border-radius:6px;padding:16px 20px;">
        <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:14px;color:#e0d4b0;">${safeCustomer.name}</p>
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;color:#9a8c6a;line-height:1.6;">${safeCustomer.address}</p>
        <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#7a6a3a;">${safeCustomer.phone}</p>
      </div>
    </td></tr>

    <!-- Promise -->
    <tr><td style="padding:0 40px 36px;">
      <div style="border-left:3px solid #d4af37;padding:12px 20px;background:#1a1810;">
        <p style="margin:0;font-family:Georgia,serif;font-size:13px;color:#c0aa7a;line-height:1.8;font-style:italic;">
          "Every piece from Surya Jewellers is handcrafted by skilled artisans in Jaipur.
          Your order is being prepared with the care and attention it deserves. We will notify
          you when it ships."
        </p>
      </div>
    </td></tr>

    <!-- Contact -->
    <tr><td style="padding:0 40px 32px;text-align:center;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#7a6a3a;">
        Questions? Contact us at&nbsp;
        <a href="mailto:${SUPPORT_EMAIL}" style="color:#d4af37;text-decoration:none;">${SUPPORT_EMAIL}</a>
        &nbsp;or&nbsp;${SUPPORT_PHONE}
      </p>
    </td></tr>
  `;

  await resend.emails.send({
    from: FROM,
    to: customer.email,
    subject: 'Order Confirmed — Surya Jewellers ✦',
    html: emailWrapper(body),
  });
}

// ─── Order Status Update ─────────────────────────────────────────────────────

interface StatusOrder {
  _id: string;
  razorpayOrderId: string;
  customer: { name: string; email: string; phone: string; address: string };
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
}

export async function sendOrderStatusEmail(order: StatusOrder, status: string) {
  if (!order.customer?.email) return;

  const firstName = escapeHtml((order.customer.name || 'Valued Customer').split(' ')[0]);

  type StatusConfig = { subject: string; headline: string; subline: string; badge: string; badgeColor: string; message: string };

  const configs: Record<string, StatusConfig> = {
    shipped: {
      subject: 'Your order has been shipped! ✦ — Surya Jewellers',
      headline: 'Your order is on its way ✦',
      subline: 'Your jewellery has been carefully packed and dispatched from our Jaipur workshop.',
      badge: 'Shipped',
      badgeColor: '#7c3aed',
      message: `Your package is on its way to you, ${firstName}. Estimated delivery is within 5–7 business days. Once your tracking information is available, we will share it with you.`,
    },
    delivered: {
      subject: 'Your order has been delivered! ✦ — Surya Jewellers',
      headline: 'Your jewellery has arrived ✦',
      subline: 'We hope you love your piece from Surya Jewellers.',
      badge: 'Delivered',
      badgeColor: '#0d9488',
      message: `We hope you are delighted with your piece, ${firstName}. If you have any questions or concerns about your order, please do not hesitate to reach out to us. We would love to see how it looks — tag us!`,
    },
    cancelled: {
      subject: 'Order Cancelled — Surya Jewellers',
      headline: 'Your order has been cancelled',
      subline: 'We are sorry to see you go.',
      badge: 'Cancelled',
      badgeColor: '#dc2626',
      message: `Your order has been cancelled, ${firstName}. If a payment was made, a refund will be processed within 5–7 business days to your original payment method. If you have any questions, please contact us.`,
    },
    failed: {
      subject: 'Order Update — Surya Jewellers',
      headline: 'There was an issue with your order',
      subline: 'Please contact us if you believe this is an error.',
      badge: 'Issue',
      badgeColor: '#dc2626',
      message: `We encountered an issue with your order, ${firstName}. Please contact us at ${SUPPORT_EMAIL} or ${SUPPORT_PHONE} and we will resolve it promptly.`,
    },
  };

  const cfg = configs[status];
  if (!cfg) return; // don't email for paid/confirmed/pending

  const itemList = (order.items || []).map((item) =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #2a2510;font-family:Georgia,serif;font-size:13px;color:#e0d4b0;">${escapeHtml(item.name)}${item.quantity > 1 ? ` ×${item.quantity}` : ''}</td>
      <td style="padding:8px 0;border-bottom:1px solid #2a2510;text-align:right;font-family:Arial,sans-serif;font-size:13px;color:#d4af37;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  const body = `
    <!-- Hero -->
    <tr><td style="padding:40px 40px 24px;text-align:center;">
      <p style="margin:0 0 10px;">
        <span style="display:inline-block;background:${cfg.badgeColor}22;color:${cfg.badgeColor};border:1px solid ${cfg.badgeColor}44;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:5px 16px;border-radius:20px;">${cfg.badge}</span>
      </p>
      <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:26px;color:#f0ead8;font-weight:normal;">${cfg.headline}</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#9a8c6a;line-height:1.6;">${cfg.subline}</p>
    </td></tr>

    <!-- Order ref -->
    <tr><td style="padding:0 40px 20px;">
      <div style="background:#1a1810;border:1px solid #2c2810;border-radius:6px;padding:14px 20px;text-align:center;">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#7a6a3a;text-transform:uppercase;">Order Reference</p>
        <p style="margin:0;font-family:'Courier New',monospace;font-size:13px;color:#d4af37;">${escapeHtml(order.razorpayOrderId || order._id)}</p>
      </div>
    </td></tr>

    <!-- Message -->
    <tr><td style="padding:0 40px 24px;">
      <div style="border-left:3px solid #d4af37;padding:12px 20px;background:#1a1810;">
        <p style="margin:0;font-family:Georgia,serif;font-size:13px;color:#c0aa7a;line-height:1.8;">${cfg.message}</p>
      </div>
    </td></tr>

    <!-- Items summary -->
    <tr><td style="padding:0 40px 28px;">
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#7a6a3a;text-transform:uppercase;">Order Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemList}
        <tr>
          <td style="padding:10px 0 0;font-family:Georgia,serif;font-size:14px;color:#e0d4b0;">Total</td>
          <td style="padding:10px 0 0;text-align:right;font-family:Georgia,serif;font-size:16px;color:#d4af37;">₹${(order.total || 0).toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </td></tr>

    <!-- Contact -->
    <tr><td style="padding:0 40px 32px;text-align:center;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#7a6a3a;">
        Need help?&nbsp;
        <a href="mailto:${SUPPORT_EMAIL}" style="color:#d4af37;text-decoration:none;">${SUPPORT_EMAIL}</a>
        &nbsp;|&nbsp;${SUPPORT_PHONE}
      </p>
    </td></tr>
  `;

  await resend.emails.send({
    from: FROM,
    to: order.customer.email,
    subject: cfg.subject,
    html: emailWrapper(body),
  });
}
