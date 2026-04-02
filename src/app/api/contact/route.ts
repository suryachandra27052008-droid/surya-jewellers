import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });
    }

    // Log submission (plug in email service like Resend here if needed)
    console.log('[Contact Form]', { name, email, phone, message });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
