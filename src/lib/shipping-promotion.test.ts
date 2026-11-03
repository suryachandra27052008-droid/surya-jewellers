import { describe, expect, it } from 'vitest';
import { campaignDate, getActiveShippingPromotion, qualifiesForShippingOffer } from './shipping-promotion';
import { getShipping } from './shipping';
import { CURRENCIES, formatPrice } from './currency';

const settings = { shippingPromotionEnabled: true, shippingPromotionId: 'diwali-2026', shippingPromotionName: 'Diwali Special',
  shippingPromotionStartDate: '2026-11-03', shippingPromotionEndDate: '2026-11-15', shippingPromotionMinOrder: 15000 };
const now = new Date('2026-11-03T12:00:00+05:30');
describe('Diwali threshold shipping', () => {
  it.each([14999.99, 15000])('keeps normal international shipping at %s', amount => expect(getShipping(amount, 'Italy', settings, now)).toBe(2500));
  it.each(['IT', 'Germany', 'US', 'Japan', 'Australia', 'GB'])('waives standard shipping above the threshold for %s', country => expect(getShipping(15000.01, country, settings, now)).toBe(0));
  it('retains normal India rules below the promotional threshold', () => {
    expect(getShipping(1999.99, 'India', settings, now)).toBe(150);
    expect(getShipping(2000, 'IN', settings, now)).toBe(0);
    expect(getShipping(15000, 'India', settings, now)).toBe(0);
  });
  it('uses exact inclusive IST dates', () => {
    expect(getActiveShippingPromotion(settings, new Date('2026-11-02T18:29:59.999Z'))).toBeNull();
    expect(getActiveShippingPromotion(settings, new Date('2026-11-02T18:30:00.000Z'))).not.toBeNull();
    expect(getActiveShippingPromotion(settings, new Date('2026-11-15T18:29:59.999Z'))).not.toBeNull();
    expect(getShipping(20000, 'IT', settings, new Date('2026-11-15T18:30:00.000Z'))).toBe(2500);
  });
  it.each(['2026-02-30', '2026-11-31', '15/11/2026', '', undefined])('fails closed on invalid date %s', date => {
    expect(Number.isNaN(campaignDate(date))).toBe(true);
    expect(getShipping(20000, 'IT', { ...settings, shippingPromotionEndDate: date }, now)).toBe(2500);
  });
  it('fails closed for disabled, missing, reversed or invalid threshold settings', () => {
    expect(getShipping(20000, 'IT', null, now)).toBe(2500);
    expect(getShipping(20000, 'IT', { ...settings, shippingPromotionEnabled: false }, now)).toBe(2500);
    expect(getActiveShippingPromotion({ ...settings, shippingPromotionMinOrder: NaN }, now)).toBeNull();
    expect(getActiveShippingPromotion({ ...settings, shippingPromotionMinOrder: 0 }, now)).toBeNull();
    expect(getActiveShippingPromotion({ ...settings, shippingPromotionStartDate: '2026-11-16' }, now)).toBeNull();
    expect(qualifiesForShippingOffer(NaN, 15000)).toBe(false);
  });
  it.each(Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>)('keeps eligibility independent of %s display rounding', currency => {
    expect(formatPrice(15000, currency)).toBeTruthy();
    expect(getShipping(15000, 'IT', settings, now)).toBe(2500);
    expect(getShipping(15000.01, 'IT', settings, now)).toBe(0);
  });
});
