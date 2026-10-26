'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAnalyticsConsent, setAnalyticsConsent, shoppingStage } from '@/lib/shopping-analytics';

export default function ShoppingAnalytics() {
  const pathname = usePathname();
  const [prompt, setPrompt] = useState(false);
  useEffect(() => {
    const check = () => {
      if (pathname.startsWith('/products/')) shoppingStage('product_view');
      if (pathname === '/checkout') shoppingStage('checkout_start');
    };
    const timer = window.setTimeout(() => {
      setPrompt(!getAnalyticsConsent() && navigator.doNotTrack !== '1' && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl);
      check();
    }, 1500);
    window.addEventListener('surya-analytics-consent', check);
    return () => { window.clearTimeout(timer); window.removeEventListener('surya-analytics-consent', check); };
  }, [pathname]);
  return <>
    {prompt && <aside aria-label="Analytics preference" className="fixed bottom-4 left-3 right-3 z-[60] max-w-sm border border-gold/30 bg-charcoal p-4 text-sm text-white shadow-lg sm:left-5 sm:right-auto">
      <p>Allow anonymous shopping analytics?</p><p className="mt-1 text-xs text-white/65">No names, email addresses or delivery details are collected. <Link href="/privacy" className="text-gold underline">Privacy</Link></p>
      <div className="mt-3 flex gap-3"><button onClick={() => { setAnalyticsConsent(true); setPrompt(false); }} className="rounded bg-gold px-4 py-2 text-xs text-charcoal">Allow</button><button onClick={() => { setAnalyticsConsent(false); setPrompt(false); }} className="rounded border border-white/30 px-4 py-2 text-xs">No thanks</button></div>
    </aside>}
    <div className="bg-charcoal px-4 py-3 text-center text-xs text-white/60 md:pb-14"><button onClick={() => setPrompt(true)} className="underline underline-offset-4">Analytics preferences</button></div>
  </>;
}
