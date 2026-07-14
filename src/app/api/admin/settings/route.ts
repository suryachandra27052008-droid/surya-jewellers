import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';

const DOC_ID = 'siteSettings';
const HANDLE_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;

function cleanDate(value: unknown): string {
  const date = String(value ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
}

function cleanInstagramHandle(value: unknown): string {
  const raw = String(value ?? '').trim();
  const fromUrl = raw.match(/instagram\.com\/([^/?#]+)/i)?.[1];
  const handle = (fromUrl ?? raw).replace(/^@/, '').replace(/\/$/, '');
  if (!HANDLE_PATTERN.test(handle)) throw new Error('Enter a valid Instagram handle.');
  return handle;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const fields: Record<string, unknown> = {};

    if ('showFreeShippingBanner' in body) fields.showFreeShippingBanner = Boolean(body.showFreeShippingBanner);
    if ('freeShippingEndDate' in body) fields.freeShippingEndDate = cleanDate(body.freeShippingEndDate);
    if ('freeShippingMinOrder' in body) {
      fields.freeShippingMinOrder = Math.max(0, Math.round(Number(body.freeShippingMinOrder) || 0));
    }
    if ('saleEnabled' in body) fields.saleEnabled = Boolean(body.saleEnabled);
    if ('saleName' in body) fields.saleName = String(body.saleName ?? '').trim().slice(0, 80);
    if ('saleDiscountPercent' in body) {
      fields.saleDiscountPercent = Math.max(0, Math.min(90, Number(body.saleDiscountPercent) || 0));
    }
    if ('saleStartDate' in body) fields.saleStartDate = cleanDate(body.saleStartDate);
    if ('saleEndDate' in body) fields.saleEndDate = cleanDate(body.saleEndDate);
    if ('showSaleBanner' in body) fields.showSaleBanner = Boolean(body.showSaleBanner);
    if ('whatsappNumber' in body) fields.whatsappNumber = String(body.whatsappNumber ?? '').trim().slice(0, 30);
    if ('instagramHandle' in body) fields.instagramHandle = cleanInstagramHandle(body.instagramHandle);

    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ error: 'No supported settings were supplied.' }, { status: 400 });
    }

    await writeClient
      .transaction()
      .createIfNotExists({ _id: DOC_ID, _type: 'siteSettings' })
      .patch(DOC_ID, { set: fields })
      .commit();

    return NextResponse.json({ success: true, settings: fields });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save settings.';
    console.error('Failed to save admin settings:', error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
