export function safeTrackingUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return '';
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password || value.length > 1000) {
    throw new Error('Tracking links must use HTTPS and cannot contain login details.');
  }
  return url.href;
}

export function orderNeedsAttention(order: { needsMerchantReview?: boolean; fulfillmentBlocked?: boolean; processingError?: string; notificationError?: string }) {
  return Boolean(order.needsMerchantReview || order.fulfillmentBlocked || order.processingError || order.notificationError);
}
