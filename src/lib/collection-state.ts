export const COLLECTION_PRICE_MIN = 0;
export const COLLECTION_PRICE_MAX = 800000;

export type CollectionState = {
  q: string; category: string; stone: string; sort: string;
  min: number; max: number; count: number; view: 'compact' | 'comfortable' | '';
};

function boundedNumber(value: string | null, fallback: number, min: number, max: number) {
  const number = value === null || value === '' ? NaN : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : fallback;
}

export function readCollectionState(params: Pick<URLSearchParams, 'get'>): CollectionState {
  const min = boundedNumber(params.get('min'), COLLECTION_PRICE_MIN, 0, COLLECTION_PRICE_MAX - 1000);
  return {
    q: params.get('q')?.slice(0, 100) || '',
    category: params.get('category')?.slice(0, 80) || 'All',
    stone: params.get('stone')?.slice(0, 80) || 'All',
    sort: ['price-asc', 'price-desc', 'newest'].includes(params.get('sort') || '') ? params.get('sort')! : 'featured',
    min, max: boundedNumber(params.get('max'), COLLECTION_PRICE_MAX, min + 1000, COLLECTION_PRICE_MAX),
    count: boundedNumber(params.get('count'), 24, 24, 10000),
    view: params.get('view') === 'comfortable' ? 'comfortable' : params.get('view') === 'compact' ? 'compact' : '',
  };
}

export function collectionHref(state: CollectionState) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.category !== 'All') params.set('category', state.category);
  if (state.stone !== 'All') params.set('stone', state.stone);
  if (state.sort !== 'featured') params.set('sort', state.sort);
  if (state.min !== COLLECTION_PRICE_MIN) params.set('min', String(state.min));
  if (state.max !== COLLECTION_PRICE_MAX) params.set('max', String(state.max));
  if (state.count !== 24) params.set('count', String(state.count));
  if (state.view) params.set('view', state.view);
  return `/products${params.size ? `?${params}` : ''}`;
}

export function safeCollectionReturn(value: string | null) {
  if (!value || value.length > 1800 || !/^\/products(?:\?|$)/.test(value)) return '/products';
  const url = new URL(value, 'https://collection.invalid');
  if (url.origin !== 'https://collection.invalid' || url.pathname !== '/products') return '/products';
  return collectionHref(readCollectionState(url.searchParams));
}
