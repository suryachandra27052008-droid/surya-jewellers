import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: 'Surya Jewellers Contact Form <onboarding@resend.dev>',
      to: ['suryajewellersjaipur@gmail.com'],
      replyTo: email,
      subject: `New enquiry from ${name}`,
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
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;"><a href="mailto:${email}" style="color: #d4af37;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Phone</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e0d0; color: #1a1a1a; font-size: 14px;">${phone || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 16px 0 0 0; color: #888; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; vertical-align: top;">Message</td>
              <td style="padding: 16px 0 0 0; color: #1a1a1a; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>

          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e8e0d0; text-align: center;">
            <p style="color: #aaa; font-size: 11px; margin: 0;">Reply to this email to respond directly to ${name}.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Contact] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Contact] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
