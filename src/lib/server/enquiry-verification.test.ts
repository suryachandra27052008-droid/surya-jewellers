import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  codeMatches,
  createCode,
  assertMailDomain,
  hashCode,
  hashIdentifier,
  maskEmail,
  normalizeEmail,
} from './enquiry-verification';

describe('enquiry verification security helpers', () => {
  beforeEach(() => {
    process.env.ENQUIRY_VERIFICATION_SECRET = 'test-secret-that-is-long-and-unique';
  });

  it('normalizes and masks an email without exposing the full local part', () => {
    expect(normalizeEmail('  Customer.Name@Example.COM ')).toBe('customer.name@example.com');
    expect(maskEmail('customer.name@example.com')).toBe('cu******@example.com');
  });

  it('creates six-digit numeric codes', () => {
    for (let index = 0; index < 25; index += 1) {
      expect(createCode()).toMatch(/^\d{6}$/);
    }
  });

  it('compares hashed codes and rejects a different code', () => {
    const verificationId = 'enquiryVerification.test-id';
    const expectedHash = hashCode(verificationId, '123456');
    expect(codeMatches(verificationId, '123456', expectedHash)).toBe(true);
    expect(codeMatches(verificationId, '654321', expectedHash)).toBe(false);
  });

  it('uses different hashes for different identifiers', () => {
    expect(hashIdentifier('customer@example.com')).not.toBe(hashIdentifier('other@example.com'));
  });

  it('rejects domains that cannot accept mail', async () => {
    await expect(assertMailDomain('customer@domain-does-not-exist.invalid')).rejects.toMatchObject({
      message: 'This email domain does not appear to accept email.',
      status: 400,
    });
  });
});
