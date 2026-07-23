import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredVerifications } from '@/lib/server/enquiry-verification';

export const runtime = 'nodejs';

function secretsMatch(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization') || '';
  if (!secret || !secretsMatch(authorization, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deleted = await cleanupExpiredVerifications();
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('[Enquiry cleanup] Error:', error);
    return NextResponse.json({ error: 'Cleanup failed.' }, { status: 500 });
  }
}

