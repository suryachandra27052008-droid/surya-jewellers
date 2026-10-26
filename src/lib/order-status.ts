export function isPaidOrder(order: { status?: string }) {
  return ['paid', 'confirmed', 'shipped', 'delivered'].includes(order.status || '');
}
