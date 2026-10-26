import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { capturePayPalOrder } from './paypal';

const fetchMock = vi.fn();
const response = (body: unknown, status = 200) => Response.json(body, { status });

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('PAYPAL_CLIENT_ID', 'test-client');
  vi.stubEnv('PAYPAL_SECRET', 'test-secret');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('PayPal capture retries', () => {
  it.each(['PENDING', 'COMPLETED', 'REFUNDED'])('reads an existing %s capture without capturing again', async status => {
    const order = { id: 'ORDER123', status: 'COMPLETED', purchase_units: [{ payments: { captures: [{ id: 'CAPTURE123', status }] } }] };
    fetchMock.mockResolvedValueOnce(response({ access_token: 'test-token' })).mockResolvedValueOnce(response(order));
    expect(await capturePayPalOrder('ORDER123')).toEqual(order);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/capture'))).toBe(false);
  });

  it('uses a stable idempotency key when capturing an approved order', async () => {
    fetchMock.mockResolvedValueOnce(response({ access_token: 'test-token' }))
      .mockResolvedValueOnce(response({ id: 'ORDER123', status: 'APPROVED' }))
      .mockResolvedValueOnce(response({ access_token: 'test-token' }))
      .mockResolvedValueOnce(response({ id: 'ORDER123', status: 'COMPLETED' }));
    await capturePayPalOrder('ORDER123');
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/ORDER123/capture'), expect.objectContaining({
      headers: expect.objectContaining({ 'PayPal-Request-Id': 'capture-ORDER123' }),
    }));
  });

  it('does not capture an unapproved order', async () => {
    fetchMock.mockResolvedValueOnce(response({ access_token: 'test-token' }))
      .mockResolvedValueOnce(response({ id: 'ORDER123', status: 'CREATED' }));
    await expect(capturePayPalOrder('ORDER123')).rejects.toThrow('not been approved');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
