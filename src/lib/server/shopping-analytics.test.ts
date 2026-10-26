import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { createIfNotExists: mocks.create } }));
import { analyticsContext, recordShoppingStage } from './shopping-analytics';

beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('ENQUIRY_VERIFICATION_SECRET', 'test-analytics-secret'); mocks.create.mockResolvedValue({}); });
afterEach(() => vi.unstubAllEnvs());
describe('privacy-limited shopping events', () => {
  it('ignores checkout analytics when no opted-in session was supplied', () => {
    expect(analyticsContext(undefined, new Headers())).toBeUndefined();
    expect(analyticsContext('an-email@example.com', new Headers())).toBeUndefined();
  });
  it('stores stage, date, country and device without raw session, IP or user agent', async () => {
    const session = '12345678-1234-1234-1234-123456789012';
    const context = analyticsContext(session, new Headers({ 'x-vercel-ip-country': 'IT', 'user-agent': 'Test iPhone browser', 'x-forwarded-for': '192.0.2.1' }))!;
    await recordShoppingStage('checkout_start', context, '2026-10-26');
    const stored = mocks.create.mock.calls[0][0];
    expect(stored).toMatchObject({ _type: 'shoppingEvent', stage: 'checkout_start', day: '2026-10-26', country: 'IT', device: 'Mobile' });
    expect(stored._id).toMatch(/^analytics\.[a-f0-9]{64}$/);
    expect(JSON.stringify(stored)).not.toMatch(/192\.0\.2\.1|12345678|iPhone|sessionHash|email|address/);
  });
  it('deduplicates repeated events for the same session and day', async () => {
    const context = analyticsContext('12345678-1234-1234-1234-123456789012', new Headers())!;
    await recordShoppingStage('add_to_bag', context, '2026-10-26'); await recordShoppingStage('add_to_bag', context, '2026-10-26');
    expect(mocks.create.mock.calls[0][0]._id).toBe(mocks.create.mock.calls[1][0]._id);
  });
});
