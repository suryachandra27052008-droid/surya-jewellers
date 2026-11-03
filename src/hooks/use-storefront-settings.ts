'use client';

import { useSyncExternalStore } from 'react';
import { getActiveSale, type SeasonalSaleSettings } from '@/lib/sale';
import { campaignDate, getActiveShippingPromotion, type ShippingPromotionSettings } from '@/lib/shipping-promotion';

export type StorefrontSettings = SeasonalSaleSettings & ShippingPromotionSettings & {
  domesticDeliveryEstimate?: string;
  internationalDeliveryEstimate?: string;
  showFreeShippingBanner?: boolean;
  freeShippingEndDate?: string;
};

const initial = { settings: null as StorefrontSettings | null, now: 0 };
let snapshot = initial;
let pending: Promise<void> | null = null;
let interval: ReturnType<typeof setInterval> | undefined;
let boundaryTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function scheduleBoundary() {
  clearTimeout(boundaryTimer);
  if (!listeners.size) return;
  const now = Date.now();
  const next = [campaignDate(snapshot.settings?.shippingPromotionStartDate),
    campaignDate(snapshot.settings?.shippingPromotionEndDate, true) + 1]
    .filter(time => Number.isFinite(time) && time > now).sort((a, b) => a - b)[0];
  if (next) boundaryTimer = setTimeout(() => {
    snapshot = { ...snapshot, now: Date.now() };
    listeners.forEach(listener => listener());
    scheduleBoundary();
    void refreshStorefrontSettings();
  }, Math.min(next - now, 2_147_483_647));
}

export function refreshStorefrontSettings() {
  if (!pending) {
    pending = fetch('/api/settings', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Settings unavailable');
        snapshot = { settings: await response.json(), now: Date.now() };
      })
      .catch(() => { snapshot = { ...snapshot, now: Date.now() }; })
      .finally(() => { pending = null; scheduleBoundary(); listeners.forEach(listener => listener()); });
  }
  return pending;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refreshStorefrontSettings();
    window.addEventListener('focus', refreshStorefrontSettings);
    interval = setInterval(() => {
      snapshot = { ...snapshot, now: Date.now() };
      listeners.forEach(notify => notify());
      void refreshStorefrontSettings();
    }, 30_000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(interval);
      clearTimeout(boundaryTimer);
      window.removeEventListener('focus', refreshStorefrontSettings);
    }
  };
}

export function useStorefrontSettings() {
  const value = useSyncExternalStore(subscribe, () => snapshot, () => initial);
  const now = new Date(value.now);
  return { settings: value.settings, now: value.now, sale: getActiveSale(value.settings, now),
    promotion: getActiveShippingPromotion(value.settings, now) };
}
