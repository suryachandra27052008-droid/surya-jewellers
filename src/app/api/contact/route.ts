import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml, isRateLimited, isValidEmail, textField } from '@/lib/server/request-security';

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 'contact')) {
      return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
    }
    const body = await req.json();
    const name = textField(body.name, 100);
    const email = textField(body.email, 254).toLowerCase();
    const phone = textField(body.phone, 30);
    const message = textField(body.message, 5000);

    if (!name || !isValidEmail(email) || !message) {
      return NextResponse.json({ error: 'Please enter a valid name, email, and message.' }, { status: 400 });
    }

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      message: escapeHtml(message),
    };

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Surya Jewellers <hello@suryajewellers.com>',
      to: 'suryajewellersjaipur@gmail.com',
      replyTo: email,
      subject: `New enquiry from ${name.replace(/[\r\n]/g, ' ')}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fafaf8; border: 1px solid #e8e0d0;">
          <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #d4af37;">
            <h1 style="font-size: 22px; color: #1a1a1a; letter-spacing: 4px; margin: 0 0 4px 0;">SURYA</h1>
            <p style="color: #d4af37; font-size: 11px; letter-spacing: 5px; margin: 0; text-transform: uppercase;">Jewellers</p>
          </div>

          <h2 style="font-size: 18px; color: #1a1a1a; margin: 0 0 24px 0;">New Contact Enquiry</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; width: 100px;">Name</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${safe.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;"><a href="mailto:${safe.email}" style="color: #d4af37;">${safe.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Phone</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${safe.phone || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 16px 0 0 0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; vertical-align: top;">Message</td>
              <td style="padding: 16px 0 0 0; color: #1a1a1a; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${safe.message}</td>
            </tr>
          </table>

          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8e0d0; text-align: center;">
            <p style="color: #aaa; font-size: 11px; margin: 0;">Reply to this email to respond directly to ${safe.name}.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Contact] Error:', err);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
