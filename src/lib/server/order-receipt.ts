import { CURRENCIES, roundedCurrencyAmount, type CurrencyCode } from '@/lib/currency';
import { escapeHtml } from '@/lib/server/request-security';

export type OrderReceipt = {
  reference: string;
  customer: { name: string; email: string };
  items: Array<{ name: string; price: number; quantity: number }>;
  discount?: { amount: number } | null;
  shipping: number;
  total: number;
  currency: CurrencyCode;
  chargedAmount?: string;
};

export function renderOrderReceipt(data: OrderReceipt) {
  const decimals = data.currency === 'JPY' ? 0 : 2;
  const symbol = CURRENCIES[data.currency].symbol;
  const money = (amount: number) => `${symbol}${amount.toFixed(decimals)}`;
  const rows = data.items.map(item => ({ ...item,
    unit: roundedCurrencyAmount(item.price, data.currency),
    line: roundedCurrencyAmount(item.price * item.quantity, data.currency),
  }));
  const subtotal = rows.reduce((sum, item) => sum + item.line, 0);
  const discount = roundedCurrencyAmount(data.discount?.amount || 0, data.currency);
  const shipping = roundedCurrencyAmount(data.shipping, data.currency);
  const total = data.chargedAmount === undefined ? roundedCurrencyAmount(data.total, data.currency) : Number(data.chargedAmount);
  const rounding = Number((total - (subtotal - discount + shipping)).toFixed(decimals));
  const tolerance = data.currency === 'JPY' ? Math.max(1, rows.length) : Math.max(0.05, rows.length * 0.01 + 0.02);
  if (!Number.isFinite(total) || Math.abs(rounding) > tolerance) throw new Error('The order currency amounts require review before confirmation.');
  const reference = escapeHtml(data.reference);
  const greeting = escapeHtml(data.customer.name || 'Customer');
  const tableRows = rows.map(item => `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #2a2510;color:#e0d4b0;">${escapeHtml(item.name)}</td>
    <td style="padding:12px 8px;border-bottom:1px solid #2a2510;text-align:center;color:#e0d4b0;">${item.quantity}</td>
    <td style="padding:12px 0;border-bottom:1px solid #2a2510;text-align:right;color:#d4af37;">${escapeHtml(money(item.line))}</td>
  </tr>`).join('');
  const summary = [
    ['Items subtotal', money(subtotal)],
    ...(discount ? [['Discount', `-${money(discount)}`]] : []),
    ['Shipping', money(shipping)],
    ...(rounding ? [['Currency rounding', `${rounding < 0 ? '-' : '+'}${money(Math.abs(rounding))}`]] : []),
    ['Order total', money(total)],
  ];
  const html = `<tr><td style="padding:32px 40px;color:#e0d4b0;font-family:Arial,sans-serif;">
    <h2 style="font-family:Georgia,serif;color:#d4af37;font-weight:normal;">Order Confirmation</h2>
    <p>Dear ${greeting},</p><p>Thank you for your order with Surya Jewellers. Here is your order summary.</p>
    <p style="font-size:12px;color:#a99976;">Order reference: ${reference}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;"><thead><tr>
      <th align="left">Item</th><th>Qty</th><th align="right">Amount (${data.currency})</th>
    </tr></thead><tbody>${tableRows}</tbody></table>
    <table width="100%" style="margin-top:18px;font-size:14px;">${summary.map(([label, value]) => `<tr><td style="padding:5px 0;">${label}</td><td align="right">${escapeHtml(value)}</td></tr>`).join('')}</table>
    <p style="font-size:13px;line-height:1.6;margin-top:24px;">Please keep this email for your records. If you have a question about your order, reply to this email.</p>
  </td></tr>`;
  const text = [
    `Dear ${data.customer.name || 'Customer'},`, '', 'Thank you for your order with Surya Jewellers.',
    `Order reference: ${data.reference}`, '',
    ...rows.map(item => `${item.name} - Qty ${item.quantity} - ${money(item.line)}`), '',
    ...summary.map(([label, value]) => `${label}: ${value}`), '',
    'Please keep this email for your records. Reply to this email with any questions about your order.',
  ].join('\n');
  return { subject: `Order confirmation - Surya Jewellers - ${data.reference}`, html, text };
}
