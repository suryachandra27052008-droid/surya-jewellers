export type ShoppingStage = 'product_view' | 'add_to_bag' | 'checkout_start';
const CONSENT_KEY = 'surya-shopping-analytics';
const SESSION_KEY = 'surya-shopping-session';

export function analyticsSession() {
  if (typeof window === 'undefined' || navigator.doNotTrack === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return '';
  try {
    if (localStorage.getItem(CONSENT_KEY) !== 'yes') return '';
    let session = sessionStorage.getItem(SESSION_KEY);
    if (!session) { session = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, session); }
    return session;
  } catch { return ''; }
}

export function shoppingStage(stage: ShoppingStage) {
  const sessionId = analyticsSession();
  if (!sessionId) return;
  void fetch('/api/analytics/shopping', { method: 'POST', keepalive: true,
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage, sessionId }),
  }).catch(() => {});
}

export function setAnalyticsConsent(allowed: boolean) {
  try {
    localStorage.setItem(CONSENT_KEY, allowed ? 'yes' : 'no');
    if (!allowed) sessionStorage.removeItem(SESSION_KEY);
  } catch { /* Analytics is optional. */ }
  window.dispatchEvent(new Event('surya-analytics-consent'));
}

export function getAnalyticsConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch { return 'no'; }
}
