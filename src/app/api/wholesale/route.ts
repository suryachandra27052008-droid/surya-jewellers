import { NextRequest, NextResponse } from 'next/server';
import {
  EnquiryError,
  normalizeEmail,
  requestVerificationCode,
  resendVerificationCode,
  verifyAndDeliver,
} from '@/lib/server/enquiry-verification';
import { escapeHtml, isValidEmail, textField } from '@/lib/server/request-security';

export const runtime = 'nodejs';

type WholesalePayload = {
  companyName: string;
  contactPerson: string;
  country: string;
  phone: string;
  email: string;
  products: string[];
  monthlyRequirement: string;
  message: string;
};

function parseWholesale(body: Record<string, unknown>): WholesalePayload {
  const payload = {
    companyName: textField(body.companyName, 120),
    contactPerson: textField(body.contactPerson, 100),
    country: textField(body.country, 80),
    phone: textField(body.phone, 30),
    email: normalizeEmail(textField(body.email, 254)),
    products: Array.isArray(body.products)
      ? body.products.slice(0, 20).map((item) => textField(item, 80)).filter(Boolean)
      : [],
    monthlyRequirement: textField(body.monthlyRequirement, 100),
    message: textField(body.message, 5000),
  };
  if (!payload.companyName || !payload.contactPerson || !isValidEmail(payload.email)) {
    throw new EnquiryError('Please enter valid company, contact, and email details.');
  }
  return payload;
}
function verifiedWholesaleEmail(payload: WholesalePayload, verifiedAt: string) {
  const safe = Object.fromEntries(
    Object.entries({
      companyName: payload.companyName,
      contactPerson: payload.contactPerson,
      country: payload.country,
      phone: payload.phone,
      email: payload.email,
      monthlyRequirement: payload.monthlyRequirement,
      message: payload.message,
    }).map(([key, value]) => [key, escapeHtml(value)]),
  ) as Record<Exclude<keyof WholesalePayload, 'products'>, string>;
  const safeProducts = payload.products.map(escapeHtml);
  const timestamp = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'long',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(verifiedAt));

  return {
    subject: `New wholesale enquiry from ${payload.companyName.replace(/[\r\n]/g, ' ')}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px;background:#fafaf8;border:1px solid #e8e0d0;">
        <div style="text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #d4af37;">
          <h1 style="font-size:22px;color:#1a1a1a;letter-spacing:4px;margin:0 0 4px;">SURYA</h1>
          <p style="color:#b99728;font-size:11px;letter-spacing:5px;margin:0;text-transform:uppercase;">Jewellers &mdash; Wholesale</p>
        </div>
        <h2 style="font-size:18px;color:#1a1a1a;margin:0 0 8px;">New Wholesale Enquiry</h2>
        <p style="font:12px Arial,sans-serif;color:#5f7a5f;margin:0 0 20px;">Email ownership verified ${escapeHtml(timestamp)}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;width:160px;">Company</td><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#1a1a1a;font-size:14px;">${safe.companyName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Contact Person</td><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#1a1a1a;font-size:14px;">${safe.contactPerson}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Country</td><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#1a1a1a;font-size:14px;">${safe.country || '&mdash;'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#1a1a1a;font-size:14px;">${safe.phone || '&mdash;'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#1a1a1a;font-size:14px;"><a href="mailto:${safe.email}" style="color:#b99728;">${safe.email}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Products</td><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#1a1a1a;font-size:14px;">${safeProducts.length ? safeProducts.join(', ') : '&mdash;'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Monthly Req.</td><td style="padding:10px 0;border-bottom:1px solid #e8e0d0;color:#1a1a1a;font-size:14px;">${safe.monthlyRequirement || '&mdash;'}</td></tr>
          <tr><td style="padding:16px 0 0;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;vertical-align:top;">Message</td><td style="padding:16px 0 0;color:#1a1a1a;font-size:14px;line-height:1.7;white-space:pre-wrap;">${safe.message || '&mdash;'}</td></tr>
        </table>
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e8e0d0;text-align:center;">
          <p style="color:#888;font-size:11px;margin:0;">Reply to this email to respond directly to ${safe.contactPerson} at ${safe.companyName}.</p>
        </div>
      </div>
    `,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = textField(body.action, 30);

    if (action === 'request-code') {
      const payload = parseWholesale(body);
      const result = await requestVerificationCode({
        request,
        kind: 'wholesale',
        email: payload.email,
        turnstileToken: textField(body.turnstileToken, 4096),
        honeypot: textField(body.website, 200),
      });
      return NextResponse.json(result);
    }

    if (action === 'resend-code') {
      const result = await resendVerificationCode({
        request,
        kind: 'wholesale',
        verificationId: textField(body.verificationId, 100),
        turnstileToken: textField(body.turnstileToken, 4096),
      });
      return NextResponse.json(result);
    }

    if (action === 'verify') {
      const payload = parseWholesale(body);
      const result = await verifyAndDeliver({
        kind: 'wholesale',
        verificationId: textField(body.verificationId, 100),
        email: payload.email,
        code: textField(body.code, 6),
        merchantEmail: (verifiedAt) => verifiedWholesaleEmail(payload, verifiedAt),
      });
      return NextResponse.json(result);
    }

    throw new EnquiryError('Email verification is required before an enquiry can be sent.', 400);
  } catch (error) {
    if (error instanceof EnquiryError) {
      return NextResponse.json({ error: error.message, ...error.details }, { status: error.status });
    }
    console.error('[Wholesale] Error:', error);
    return NextResponse.json({ error: 'The enquiry could not be processed. Please try again.' }, { status: 500 });
  }
}
