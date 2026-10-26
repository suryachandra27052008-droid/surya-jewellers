import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ user: vi.fn(), fetch: vi.fn() }));
vi.mock('@clerk/nextjs/server', () => ({ currentUser: mocks.user }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { fetch: mocks.fetch } }));
import { ownsOrder, verifiedOrderEmails } from './customer-orders';
import { GET } from '@/app/api/account/orders/route';

beforeEach(() => vi.clearAllMocks());
describe('private customer order history', () => {
  it('requires a signed-in customer', async () => {
    mocks.user.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('uses only server-verified email addresses to find older orders', async () => {
    mocks.user.mockResolvedValue({ id: 'user-owned', emailAddresses: [
      { emailAddress: 'BUYER@example.com', verification: { status: 'verified' } },
      { emailAddress: 'other@example.com', verification: { status: 'unverified' } },
    ] });
    mocks.fetch.mockResolvedValue([]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.fetch.mock.calls[0][1]).toEqual({ userId: 'user-owned', emails: ['buyer@example.com'] });
    const query = mocks.fetch.mock.calls[0][0];
    expect(query).not.toMatch(/internalNotes|notificationError|customer\.address/);
  });
  it('never gives an account an order already owned by someone else', () => {
    expect(ownsOrder({ ownerUserId: 'user-other', customer: { email: 'buyer@example.com' } }, 'user-owned', ['buyer@example.com'])).toBe(false);
    expect(ownsOrder({ ownerUserId: 'user-owned' }, 'user-owned', [])).toBe(true);
    expect(ownsOrder({ customer: { email: 'buyer@example.com' } }, 'user-owned', ['buyer@example.com'])).toBe(true);
    expect(verifiedOrderEmails({ emailAddresses: [{ emailAddress: 'other@example.com', verification: { status: 'unverified' } }] })).toEqual([]);
  });
});
