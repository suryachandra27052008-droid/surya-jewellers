import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sd28lfuz';
const DATASET   = process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production';
const API_VER   = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
const DOC_ID    = 'siteSettings';

const readClient = createClient({ projectId: PROJECT_ID, dataset: DATASET, apiVersion: API_VER, useCdn: false });

function fileDefaults() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'src/data/settings.json'), 'utf8'));
  } catch {
    return {
      showFreeShippingBanner: false,
      freeShippingEndDate: '',
      freeShippingMinOrder: 2000,
      saleEnabled: false,
      saleName: 'Spring Sale',
      saleDiscountPercent: 20,
      saleStartDate: '',
      saleEndDate: '',
      showSaleBanner: true,
      whatsappNumber: '+91 99839 39306',
      instagramHandle: 'suryajewellersjaipur',
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
    whatsappNumber: doc.whatsappNumber ?? defaults.whatsappNumber,
    instagramHandle: doc.instagramHandle ?? defaults.instagramHandle,
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

export async function POST() {
  return NextResponse.json({ error: 'Use the authenticated admin settings endpoint.' }, { status: 405 });
}
