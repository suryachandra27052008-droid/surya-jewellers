import { revalidatePath, revalidateTag } from 'next/cache';

export const PRODUCT_CATALOG_TAG = 'product-catalog';

export function invalidateProductCatalog() {
  revalidateTag(PRODUCT_CATALOG_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
  revalidatePath('/api/catalog');
  revalidatePath('/api/catalog/recommendations');
}
