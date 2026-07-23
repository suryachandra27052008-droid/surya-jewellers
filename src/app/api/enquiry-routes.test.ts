import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('server-only', () => ({}));

import { POST as contactPost } from './contact/route';
import { POST as wholesalePost } from './wholesale/route';

function request(path: string, body: Record<string, unknown>) {
  return new NextRequest(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('verified enquiry route guards', () => {
  it('rejects the old direct Contact submission payload', async () => {
    const response = await contactPost(
      request('/api/contact', {
        name: 'Test Customer',
        email: 'customer@example.com',
        message: 'This must not be delivered without verification.',
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('verification is required'),
    });
  });

  it('rejects the old direct Wholesale submission payload', async () => {
    const response = await wholesalePost(
      request('/api/wholesale', {
        companyName: 'Test Company',
        contactPerson: 'Test Buyer',
        email: 'buyer@example.com',
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('verification is required'),
    });
  });

  it('rejects a malformed email before attempting a security challenge', async () => {
    const response = await contactPost(
      request('/api/contact', {
        action: 'request-code',
        name: 'Test Customer',
        email: 'not-an-email',
        message: 'Hello',
        turnstileToken: 'unused',
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining('valid name, email, and message'),
    });
  });
});

