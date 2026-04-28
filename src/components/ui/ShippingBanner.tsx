'use client';

import { useState, useEffect } from 'react';
import { getActiveSale, type SeasonalSaleSettings } from '@/lib/sale';

interface BannerSettings extends SeasonalSaleSettings {
  showFreeShippingBanner: boolean;
  freeShippingEndDate: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ShippingBanner() {
  const [settings, setSettings] = useState<BannerSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  if (!settings) return null;

  const sale = getActiveSale(settings);
  const message =
    sale && settings.showSaleBanner
      ? `${sale.name} - ${sale.percent}% off all jewellery`
      : settings.showFreeShippingBanner
        ? `Free Shipping - Limited Time Offer! Valid till ${formatDate(settings.freeShippingEndDate)}`
        : '';

  if (!message) return null;

  return (
    <div className="w-full text-center py-2.5 px-4" style={{ backgroundColor: '#c9a84c' }}>
      <p className="text-charcoal text-xs font-semibold tracking-[0.25em] uppercase">
        + &nbsp; {message} &nbsp; +
      </p>
    </div>
  );
}
