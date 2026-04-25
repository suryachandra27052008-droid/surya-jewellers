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
    return { showFreeShippingBanner: true, freeShippingEndDate: '2026-05-04', freeShippingMinOrder: 2000 };
  }
}

export async function GET() {
  try {
    const doc = await readClient.fetch(`*[_type == "siteSettings" && _id == $id][0]`, { id: DOC_ID });
    if (doc) {
      const defaults = fileDefaults();
      return NextResponse.json({
        showFreeShippingBanner: doc.showFreeShippingBanner ?? defaults.showFreeShippingBanner,
        freeShippingEndDate:    doc.freeShippingEndDate    ?? defaults.freeShippingEndDate,
        freeShippingMinOrder:   doc.freeShippingMinOrder   ?? defaults.freeShippingMinOrder,
      });
    }
  } catch {
    // fall through to file defaults
  }
  return NextResponse.json(fileDefaults());
}

export async function POST(request) {
  const body = await request.json();
  const defaults = fileDefaults();
  const fields = {
    showFreeShippingBanner: body.showFreeShippingBanner ?? defaults.showFreeShippingBanner,
    freeShippingEndDate:    body.freeShippingEndDate    ?? defaults.freeShippingEndDate,
    freeShippingMinOrder:   body.freeShippingMinOrder   ?? defaults.freeShippingMinOrder,
  };
  try {
    await writeClient
      .transaction()
      .createIfNotExists({ _id: DOC_ID, _type: 'siteSettings' })
      .patch(DOC_ID, { set: fields })
      .commit();
    return NextResponse.json({ success: true, settings: fields });
  } catch (err) {
    console.error('Failed to save settings to Sanity:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
