import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    const { companyName, contactPerson, country, phone, email, products, monthlyRequirement, message } = body;

    if (!companyName || !contactPerson || !email) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: 'Surya Jewellers Wholesale <onboarding@resend.dev>',
      to: ['suryajewellersjaipur@gmail.com'],
      replyTo: email,
      subject: `New Wholesale Enquiry from ${companyName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fafaf8; border: 1px solid #e8e0d0;">
          <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #d4af37;">
            <h1 style="font-size: 22px; color: #1a1a1a; letter-spacing: 4px; margin: 0 0 4px 0;">SURYA</h1>
            <p style="color: #d4af37; font-size: 11px; letter-spacing: 5px; margin: 0; text-transform: uppercase;">Jewellers — Wholesale</p>
          </div>

          <h2 style="font-size: 18px; color: #1a1a1a; margin: 0 0 24px 0;">New Wholesale Enquiry</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; width: 160px;">Company</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${companyName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Contact Person</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${contactPerson}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Country</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${country || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Phone</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${phone || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;"><a href="mailto:${email}" style="color: #d4af37;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Products</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${products && products.length > 0 ? products.join(', ') : '—'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Monthly Req.</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${monthlyRequirement || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 16px 0 0 0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; vertical-align: top;">Message</td>
              <td style="padding: 16px 0 0 0; color: #1a1a1a; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message || '—'}</td>
            </tr>
          </table>

          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8e0d0; text-align: center;">
            <p style="color: #aaa; font-size: 11px; margin: 0;">Reply to this email to respond directly to ${contactPerson} at ${companyName}.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Wholesale] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Wholesale] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
