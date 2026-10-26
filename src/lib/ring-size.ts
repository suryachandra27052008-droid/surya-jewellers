export const RING_SIZES = Array.from({ length: 16 }, (_, index) => index + 5);

export function isRingCategory(category: string | undefined) {
  return /^rings?$/i.test(category?.trim() || '');
}

export function readRingSize(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 5 || value > 20) {
    throw new Error('Please select a ring size between 5 and 20.');
  }
  return value;
}

export function cartLineKey(item: { _id: string; ringSize?: number }) {
  return item.ringSize === undefined ? item._id : `${item._id}::size-${item.ringSize}`;
}

export function orderRingSizeLabel(item: { name?: string; category?: string; ringSize?: number }) {
  if (item.ringSize !== undefined) return `Ring size (India): ${item.ringSize}`;
  if (isRingCategory(item.category) || /\brings?\b/i.test(item.name || '')) {
    return 'Ring size not recorded - confirm with customer';
  }
  return '';
}
