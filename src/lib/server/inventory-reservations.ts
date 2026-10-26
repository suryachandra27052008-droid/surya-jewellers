import { randomUUID } from 'node:crypto';
import { writeClient } from '@/lib/sanity/client';

export const RESERVATION_MS = 20 * 60_000;
export type StockLine = { _id: string; quantity: number };
type Hold = { id: string; quantity: number; expiresAt: string; paymentPending?: boolean };
type StockProduct = { _id: string; _rev: string; name?: string; stockQuantity?: number; inStock?: boolean; checkoutReservation?: Hold };

export function availableStock(product: Pick<StockProduct, 'stockQuantity' | 'inStock'>) {
  return product.inStock === false ? 0 : Math.max(0, Math.floor(product.stockQuantity ?? 1));
}

export function reservationBlocks(hold: Hold | undefined, owner: string, now = Date.now()) {
  return Boolean(hold && hold.id !== owner && (hold.paymentPending || Date.parse(hold.expiresAt) > now));
}

export function combineStockLines(lines: StockLine[]) {
  const quantities = new Map<string, number>();
  if (!Array.isArray(lines) || !lines.length || lines.length > 50) throw new Error('Please review the items in your bag.');
  for (const line of lines) {
    if (!/^[\w.-]{1,128}$/.test(line._id) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 100) {
      throw new Error('Invalid item quantity.');
    }
    quantities.set(line._id, (quantities.get(line._id) || 0) + line.quantity);
  }
  return Array.from(quantities, ([_id, quantity]) => ({ _id, quantity }));
}

export async function reserveStock(input: StockLine[], id: string = randomUUID(), paymentPending = false) {
  const lines = combineStockLines(input);
  const products = await writeClient.getDocuments<StockProduct>(lines.map(line => line._id));
  const expiresAt = new Date(Date.now() + RESERVATION_MS).toISOString();
  let transaction = writeClient.transaction();
  for (const line of lines) {
    const product = products.find(entry => entry?._id === line._id);
    if (!product || availableStock(product) < line.quantity || reservationBlocks(product.checkoutReservation, id)) {
      throw new Error(`${product?.name || 'An item'} is unavailable or reserved by another customer. Please refresh your bag.`);
    }
    transaction = transaction.patch(line._id, patch => patch.ifRevisionId(product._rev).set({
      checkoutReservation: { id, quantity: line.quantity, expiresAt, paymentPending },
    }));
  }
  // Revision guards and an atomic transaction prevent two buyers taking the same stock.
  await transaction.commit();
  return { id, expiresAt };
}

export async function releaseStock(input: StockLine[], id: string) {
  const lines = combineStockLines(input);
  const products = await writeClient.getDocuments<StockProduct>(lines.map(line => line._id));
  let transaction = writeClient.transaction();
  let changed = false;
  for (const product of products) {
    if (!product || product.checkoutReservation?.id !== id) continue;
    changed = true;
    transaction = transaction.patch(product._id, patch => patch.ifRevisionId(product._rev).unset(['checkoutReservation']));
  }
  if (changed) await transaction.commit();
}

export async function commitStock(order: { _id: string; reservationId?: string; items: { productId: string; quantity: number }[] }) {
  const current = await writeClient.getDocument<{ _id: string; _rev: string; inventoryCommittedAt?: string }>(order._id);
  if (!current) throw new Error('The saved order is missing.');
  if (current.inventoryCommittedAt) return;
  const lines = combineStockLines(order.items.map(item => ({ _id: item.productId, quantity: item.quantity })));
  const products = await writeClient.getDocuments<StockProduct>(lines.map(line => line._id));
  let transaction = writeClient.transaction();
  for (const line of lines) {
    const product = products.find(entry => entry?._id === line._id);
    if (!product || availableStock(product) < line.quantity || reservationBlocks(product.checkoutReservation, order.reservationId || '')) {
      throw new Error('Stock allocation needs merchant review. Do not dispatch this order until resolved.');
    }
    const remaining = availableStock(product) - line.quantity;
    transaction = transaction.patch(line._id, patch => patch.ifRevisionId(product._rev)
      .set({ stockQuantity: remaining, inStock: remaining > 0 }).unset(['checkoutReservation']));
  }
  transaction = transaction.patch(order._id, patch => patch.ifRevisionId(current._rev).set({
    inventoryCommittedAt: new Date().toISOString(), fulfillmentBlocked: false,
  }));
  await transaction.commit();
}
