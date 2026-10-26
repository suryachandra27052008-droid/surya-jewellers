import { describe, expect, it } from 'vitest';
import { renderOrderReceipt, type OrderReceipt } from './order-receipt';

const receipt: OrderReceipt = {
  reference: 'SJ-EXAMPLE', customer: { name: 'Test Buyer', email: 'buyer@example.com' },
  items: [
    { name: 'Emerald Ring', price: 5999, quantity: 1 },
    { name: 'Ruby Stud', price: 8999, quantity: 1 },
    { name: 'Diamond Polki Stud', price: 7999, quantity: 1 },
  ], shipping: 0, total: 22997, currency: 'EUR', chargedAmount: '221.13',
};

describe('customer order confirmation', () => {
  it('shows the original order and total without payment-provider status or cleared-funds claims', () => {
    const result = renderOrderReceipt(receipt);
    expect(result.text).toContain('Emerald Ring - Qty 1 - €57.68');
    expect(result.text).toContain('Ruby Stud - Qty 1 - €86.53');
    expect(result.text).toContain('Diamond Polki Stud - Qty 1 - €76.91');
    expect(result.text).toContain('Shipping: €0.00');
    expect(result.text).toContain('Currency rounding: +€0.01');
    expect(result.text).toContain('Order total: €221.13');
    expect(result.subject + result.text + result.html).not.toMatch(/paypal|pending|unclaimed|payment (received|completed)|paid|dispatch/i);
  });
  it('does not send a confirmation with mismatched currency amounts', () => {
    expect(() => renderOrderReceipt({ ...receipt, chargedAmount: '300.00' })).toThrow('require review');
  });
  it('escapes customer-provided markup', () => {
    expect(renderOrderReceipt({ ...receipt, customer: { ...receipt.customer, name: '<script>bad</script>' } }).html).toContain('&lt;script&gt;');
  });
  it('shows the saved ring size in both receipt formats', () => {
    const result = renderOrderReceipt({ ...receipt, items: receipt.items.map((item, index) => index === 0 ? { ...item, ringSize: 12 } : item) });
    expect(result.text).toContain('Emerald Ring - Ring size (India): 12');
    expect(result.html).toContain('Ring size (India): 12');
  });
});
