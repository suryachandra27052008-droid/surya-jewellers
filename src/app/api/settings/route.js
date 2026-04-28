import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sd28lfuz';
const DATASET   = process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production';
const API_VER   = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
const DOC_ID    = 'siteSettings';

const readClient = createClient({ projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VER, useCdn: false });
const writeClient = createClient({ projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VER, useCdn: false, token: process.env.SANITY_API_TOKEN });

function fileDefaults() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'src/data/settings.json'), 'utf8'));
  } catch {
    return {
      showFreeShippingBanner: true,
      freeShippingEndDate: '2026-05-04',
      freeShippingMinOrder: 2000,
      saleEnabled: false,
      saleName: 'Spring Sale',
      saleDiscountPercent: 20,
      saleStartDate: '',
      saleEndDate: '',
      showSaleBanner: true,
    };
  }
}

function publicSettings(doc = {}, defaults = fileDefaults()) {
  return {
    showFreeShippingBanner: doc.showFreeShippingBanner ?? defaults.showFreeShippingBanner,
    freeShippingEndDate: doc.freeShippingEndDate ?? defaults.freeShippingEndDate,
    freeShippingMinOrder: doc.freeShippingMinOrder ?? defaults.freeShippingMinOrder,
    saleEnabled: doc.saleEnabled ?? defaults.saleEnabled,
    saleName: doc.saleName ?? defaults.saleName,
    saleDiscountPercent: doc.saleDiscountPercent ?? defaults.saleDiscountPercent,
    saleStartDate: doc.saleStartDate ?? defaults.saleStartDate,
    saleEndDate: doc.saleEndDate ?? defaults.saleEndDate,
    showSaleBanner: doc.showSaleBanner ?? defaults.showSaleBanner,
  };
}

export async function GET() {
  try {
    const doc = await readClient.fetch(`*[_type == "siteSettings" && _id == $id][0]`, { id: DOC_ID });
    if (doc) {
      return NextResponse.json(publicSettings(doc));
    }
  } catch {
    // fall through to file defaults
  }
  return NextResponse.json(fileDefaults());
}

export async function POST(request) {
  const body = await request.json();
  const allowedFields = [
    'showFreeShippingBanner',
    'freeShippingEndDate',
    'freeShippingMinOrder',
    'saleEnabled',
    'saleName',
    'saleDiscountPercent',
    'saleStartDate',
    'saleEndDate',
    'showSaleBanner',
  ];
  const fields = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, key)) fields[key] = body[key];
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'saleDiscountPercent')) {
    const percent = Number(fields.saleDiscountPercent);
    fields.saleDiscountPercent = Number.isFinite(percent) ? Math.max(0, Math.min(90, percent)) : 0;
  }

  try {
    await writeClient
      .transaction()
      .createIfNotExists({ _id: DOC_ID, _type: 'siteSettings' })
      .patch(DOC_ID, { set: fields })
      .commit();
    const doc = await readClient.fetch(`*[_type == "siteSettings" && _id == $id][0]`, { id: DOC_ID });
    return NextResponse.json({ success: true, settings: publicSettings(doc) });
  } catch (err) {
    console.error('Failed to save settings to Sanity:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
