import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, contactPerson, country, phone, email, products, monthlyRequirement, message } = body;

    if (!companyName || !contactPerson || !email) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });
    }

    // Log submission (plug in email service like Resend here if needed)
    console.log('[Wholesale Enquiry]', { companyName, contactPerson, country, phone, email, products, monthlyRequirement, message });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
