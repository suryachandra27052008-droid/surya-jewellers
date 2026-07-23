import 'server-only';

import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { resolve4, resolve6, resolveMx } from 'node:dns/promises';
import type { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { writeClient } from '@/lib/sanity/client';
import { isRateLimited } from '@/lib/server/request-security';

export type EnquiryKind = 'contact' | 'wholesale';

type VerificationRecord = {
  _id: string;
  _rev: string;
  _type: 'enquiryVerification';
  kind: EnquiryKind;
  email?: string;
  emailHash: string;
  ipHash: string;
  codeHash?: string;
  status: 'pending' | 'processing' | 'verified' | 'locked';
  attempts: number;
  sendCount: number;
  createdAt: string;
  updatedAt: string;
  lastSentAt: string;
  expiresAt: string;
  verifiedAt?: string;
};

type TurnstileResponse = {
  success: boolean;
  hostname?: string;
  action?: string;
  'error-codes'?: string[];
};

type MerchantEmail = {
  subject: string;
  html: string;
};

const CODE_TTL_MS = 10 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_ATTEMPTS = 5;
const MAX_CODE_SENDS = 3;
const EMAIL_LIMIT_WINDOW_MS = 15 * 60_000;
const IP_LIMIT_WINDOW_MS = 60 * 60_000;
const TEST_TURNSTILE_SECRET = '1x0000000000000000000000000000000AA';
const FROM_ADDRESS = 'Surya Jewellers <hello@suryajewellers.com>';
const MERCHANT_ADDRESS = 'suryajewellersjaipur@gmail.com';

export class EnquiryError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'EnquiryError';
  }
}

function getSecret(): string {
  const secret = process.env.ENQUIRY_VERIFICATION_SECRET;
  if (!secret) {
    throw new EnquiryError('Email verification is temporarily unavailable.', 503);
  }
  return secret;
}

function getTurnstileSecret(): string {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return TEST_TURNSTILE_SECRET;
  throw new EnquiryError('Security verification is temporarily unavailable.', 503);
}

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new EnquiryError('Email delivery is temporarily unavailable.', 503);
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function maskEmail(email: string): string {
  const [local, domain] = normalizeEmail(email).split('@');
  if (!local || !domain) return 'your email address';
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(2, Math.min(6, local.length - visible.length)))}@${domain}`;
}

export function hashIdentifier(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function createCode(): string {
  const developmentCode = process.env.ENQUIRY_TEST_CODE;
  if (process.env.NODE_ENV !== 'production' && developmentCode && /^\d{6}$/.test(developmentCode)) {
    return developmentCode;
  }
  return randomInt(100_000, 1_000_000).toString();
}

export function hashCode(verificationId: string, code: string): string {
  return createHmac('sha256', getSecret()).update(`${verificationId}:${code}`).digest('hex');
}

export function codeMatches(verificationId: string, code: string, expectedHash: string): boolean {
  const received = Buffer.from(hashCode(verificationId, code), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function getRequestIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function expectedTurnstileHostnames(request: NextRequest): Set<string> {
  const requestHostname = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  return new Set(
    ['www.suryajewellers.com', 'suryajewellers.com', requestHostname]
      .filter((hostname): hostname is string => Boolean(hostname)),
  );
}

export async function validateTurnstile(
  request: NextRequest,
  token: string,
  expectedAction: string,
): Promise<void> {
  if (!token) {
    throw new EnquiryError('Please complete the security check and try again.', 400);
  }

  const secret = getTurnstileSecret();
  let response: Response;
  try {
    response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: getRequestIp(request),
      }),
      signal: AbortSignal.timeout(8_000),
      cache: 'no-store',
    });
  } catch {
    throw new EnquiryError('The security check could not be reached. Please try again.', 503);
  }

  if (!response.ok) {
    throw new EnquiryError('The security check could not be completed. Please try again.', 503);
  }

  const result = (await response.json()) as TurnstileResponse;
  if (!result.success) {
    throw new EnquiryError('The security check expired or failed. Please try again.', 400);
  }

  const isTestKey = secret === TEST_TURNSTILE_SECRET;
  if (!isTestKey && result.action !== expectedAction) {
    throw new EnquiryError('The security check did not match this form. Please refresh and try again.', 400);
  }

  const hostname = result.hostname?.toLowerCase();
  if (!isTestKey && (!hostname || !expectedTurnstileHostnames(request).has(hostname))) {
    throw new EnquiryError('The security check was issued for a different website.', 400);
  }
}

export async function assertMailDomain(email: string): Promise<void> {
  const domain = normalizeEmail(email).split('@')[1];
  if (!domain) throw new EnquiryError('Please enter a valid email address.');

  try {
    const mx = await resolveMx(domain);
    if (mx.some((record) => record.exchange && record.exchange !== '.')) return;
  } catch {
    // Some valid domains accept mail on their A/AAAA record when no MX is present.
  }

  try {
    const [ipv4, ipv6] = await Promise.allSettled([resolve4(domain), resolve6(domain)]);
    const hasAddress =
      (ipv4.status === 'fulfilled' && ipv4.value.length > 0) ||
      (ipv6.status === 'fulfilled' && ipv6.value.length > 0);
    if (hasAddress) return;
  } catch {
    // The common error below is intentionally the only DNS detail exposed.
  }

  throw new EnquiryError('This email domain does not appear to accept email.', 400);
}

function verificationEmail(code: string, expiresAt: string): string {
  const expiry = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(expiresAt));

  return `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafaf8; border: 1px solid #e8e0d0;">
      <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #d4af37;">
        <h1 style="font-size:22px; color:#1a1a1a; letter-spacing:4px; margin:0 0 4px;">SURYA</h1>
        <p style="color:#b99728; font-size:11px; letter-spacing:5px; margin:0; text-transform:uppercase;">Jewellers</p>
      </div>
      <h2 style="font-size:20px; color:#1a1a1a; margin:0 0 12px;">Verify your email</h2>
      <p style="color:#555; font-size:14px; line-height:1.7; margin:0 0 24px;">
        Enter this code on the Surya Jewellers form. Your enquiry will only be delivered after the code is verified.
      </p>
      <div style="background:#111; color:#d4af37; text-align:center; font:600 32px/1.2 Arial,sans-serif; letter-spacing:10px; padding:20px 14px; margin-bottom:20px;">${code}</div>
      <p style="color:#777; font-size:12px; line-height:1.6; margin:0;">
        This code expires at ${expiry} IST and can be used once. If you did not request it, no action is needed.
      </p>
    </div>
  `;
}

async function durableLimitCounts(emailHash: string, ipHash: string): Promise<{ email: number; ip: number }> {
  const now = Date.now();
  const emailSince = new Date(now - EMAIL_LIMIT_WINDOW_MS).toISOString();
  const ipSince = new Date(now - IP_LIMIT_WINDOW_MS).toISOString();
  return writeClient.fetch(
    `{
      "email": count(*[_type == "enquiryVerificationEvent" && emailHash == $emailHash && createdAt >= $emailSince]),
      "ip": count(*[_type == "enquiryVerificationEvent" && ipHash == $ipHash && createdAt >= $ipSince])
    }`,
    { emailHash, ipHash, emailSince, ipSince },
  );
}

async function assertDurableLimits(emailHash: string, ipHash: string): Promise<void> {
  const counts = await durableLimitCounts(emailHash, ipHash);
  if (counts.email >= 3) {
    throw new EnquiryError('Too many verification codes were requested for this email. Please wait 15 minutes.', 429);
  }
  if (counts.ip >= 5) {
    throw new EnquiryError('Too many verification codes were requested. Please try again later.', 429);
  }
}

async function getRecord(verificationId: string, kind: EnquiryKind): Promise<VerificationRecord> {
  const record = await writeClient.fetch<VerificationRecord | null>(
    `*[_id == $id && _type == "enquiryVerification" && kind == $kind][0]`,
    { id: verificationId, kind },
  );
  if (!record) throw new EnquiryError('This verification request was not found. Please request a new code.', 404);
  return record;
}

function assertPendingRecord(record: VerificationRecord): void {
  if (record.status === 'verified') {
    throw new EnquiryError('This enquiry has already been sent.', 409);
  }
  if (record.status === 'processing') {
    throw new EnquiryError('This enquiry is already being processed. Please wait a moment.', 409);
  }
  if (record.status === 'locked' || record.attempts >= MAX_ATTEMPTS) {
    throw new EnquiryError('Too many incorrect codes. Please request a new code.', 429);
  }
  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    throw new EnquiryError('This verification code has expired. Please request a new code.', 410);
  }
}

export async function requestVerificationCode(params: {
  request: NextRequest;
  kind: EnquiryKind;
  email: string;
  turnstileToken: string;
  honeypot?: string;
}): Promise<Record<string, unknown>> {
  const { request, kind, turnstileToken } = params;
  const email = normalizeEmail(params.email);
  if (params.honeypot) throw new EnquiryError('Unable to process this request.', 400);
  if (isRateLimited(request, `${kind}:request-code`, 5, 60_000)) {
    throw new EnquiryError('Too many requests. Please wait a moment and try again.', 429);
  }

  await validateTurnstile(request, turnstileToken, `${kind}_enquiry`);
  await assertMailDomain(email);

  const ipHash = hashIdentifier(getRequestIp(request));
  const emailHash = hashIdentifier(email);
  await assertDurableLimits(emailHash, ipHash);

  const id = `enquiryVerification.${randomUUID()}`;
  const code = createCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_TTL_MS).toISOString();
  const eventId = `enquiryVerificationEvent.${randomUUID()}`;
  const timestamp = now.toISOString();

  await writeClient
    .transaction()
    .create({
      _id: id,
      _type: 'enquiryVerification',
      kind,
      email,
      emailHash,
      ipHash,
      codeHash: hashCode(id, code),
      status: 'pending',
      attempts: 0,
      sendCount: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastSentAt: timestamp,
      expiresAt,
    })
    .create({
      _id: eventId,
      _type: 'enquiryVerificationEvent',
      verificationId: id,
      emailHash,
      ipHash,
      createdAt: timestamp,
    })
    .commit();

  try {
    const { error } = await getResend().emails.send(
      {
        from: FROM_ADDRESS,
        to: email,
        subject: `${code} is your Surya Jewellers verification code`,
        html: verificationEmail(code, expiresAt),
      },
      { idempotencyKey: `enquiry-code/${id}/1` },
    );
    if (error) throw error;
  } catch (error) {
    await writeClient.transaction().delete(id).delete(eventId).commit().catch(() => undefined);
    console.error(`[${kind}] Verification email failed:`, error);
    throw new EnquiryError('We could not send the verification email. Please try again.', 502);
  }

  return {
    verificationId: id,
    maskedEmail: maskEmail(email),
    expiresAt,
    resendAfterSeconds: RESEND_COOLDOWN_MS / 1000,
  };
}

export async function resendVerificationCode(params: {
  request: NextRequest;
  kind: EnquiryKind;
  verificationId: string;
  turnstileToken: string;
}): Promise<Record<string, unknown>> {
  const { request, kind, verificationId, turnstileToken } = params;
  if (isRateLimited(request, `${kind}:resend-code`, 5, 60_000)) {
    throw new EnquiryError('Too many requests. Please wait a moment and try again.', 429);
  }
  await validateTurnstile(request, turnstileToken, `${kind}_enquiry`);

  const record = await getRecord(verificationId, kind);
  assertPendingRecord(record);
  if (!record.email) throw new EnquiryError('This verification request is no longer active.', 409);
  if (record.sendCount >= MAX_CODE_SENDS) {
    throw new EnquiryError('The maximum number of codes has been sent. Please start again later.', 429);
  }

  const cooldownRemaining = RESEND_COOLDOWN_MS - (Date.now() - new Date(record.lastSentAt).getTime());
  if (cooldownRemaining > 0) {
    throw new EnquiryError('Please wait before requesting another code.', 429, {
      retryAfterSeconds: Math.ceil(cooldownRemaining / 1000),
    });
  }

  await assertDurableLimits(record.emailHash, record.ipHash);
  const code = createCode();
  const now = new Date();
  const timestamp = now.toISOString();
  const expiresAt = new Date(now.getTime() + CODE_TTL_MS).toISOString();
  const nextSendCount = record.sendCount + 1;
  const eventId = `enquiryVerificationEvent.${randomUUID()}`;

  await writeClient
    .transaction()
    .patch(verificationId, (patch) =>
      patch
        .ifRevisionId(record._rev)
        .set({
          codeHash: hashCode(verificationId, code),
          lastSentAt: timestamp,
          updatedAt: timestamp,
          expiresAt,
          sendCount: nextSendCount,
        }),
    )
    .create({
      _id: eventId,
      _type: 'enquiryVerificationEvent',
      verificationId,
      emailHash: record.emailHash,
      ipHash: record.ipHash,
      createdAt: timestamp,
    })
    .commit();

  try {
    const { error } = await getResend().emails.send(
      {
        from: FROM_ADDRESS,
        to: record.email,
        subject: `${code} is your new Surya Jewellers verification code`,
        html: verificationEmail(code, expiresAt),
      },
      { idempotencyKey: `enquiry-code/${verificationId}/${nextSendCount}` },
    );
    if (error) throw error;
  } catch (error) {
    console.error(`[${kind}] Resend verification email failed:`, error);
    throw new EnquiryError('We could not resend the verification email. Please try again later.', 502);
  }

  return {
    verificationId,
    maskedEmail: maskEmail(record.email),
    expiresAt,
    resendAfterSeconds: RESEND_COOLDOWN_MS / 1000,
  };
}

export async function verifyAndDeliver(params: {
  kind: EnquiryKind;
  verificationId: string;
  email: string;
  code: string;
  merchantEmail: (verifiedAt: string) => MerchantEmail;
}): Promise<{ success: true }> {
  const { kind, verificationId } = params;
  const record = await getRecord(verificationId, kind);
  assertPendingRecord(record);
  const email = normalizeEmail(params.email);
  if (hashIdentifier(email) !== record.emailHash) {
    throw new EnquiryError('The email address was changed. Please request a new code.', 400);
  }
  if (!/^\d{6}$/.test(params.code) || !record.codeHash || !codeMatches(verificationId, params.code, record.codeHash)) {
    const attempts = record.attempts + 1;
    await writeClient
      .patch(verificationId)
      .ifRevisionId(record._rev)
      .set({
        attempts,
        status: attempts >= MAX_ATTEMPTS ? 'locked' : 'pending',
        updatedAt: new Date().toISOString(),
      })
      .commit();
    throw new EnquiryError(
      attempts >= MAX_ATTEMPTS
        ? 'Too many incorrect codes. Please request a new code.'
        : 'That code is incorrect. Please check the email and try again.',
      attempts >= MAX_ATTEMPTS ? 429 : 400,
      { attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attempts) },
    );
  }

  const processingAt = new Date().toISOString();
  try {
    await writeClient
      .patch(verificationId)
      .ifRevisionId(record._rev)
      .set({ status: 'processing', updatedAt: processingAt })
      .commit();
  } catch {
    throw new EnquiryError('This enquiry is already being processed. Please wait a moment.', 409);
  }

  const merchant = params.merchantEmail(processingAt);
  try {
    const { error } = await getResend().emails.send(
      {
        from: FROM_ADDRESS,
        to: MERCHANT_ADDRESS,
        replyTo: email,
        subject: `[Verified] ${merchant.subject}`,
        html: merchant.html,
      },
      { idempotencyKey: `verified-enquiry/${verificationId}` },
    );
    if (error) throw error;
  } catch (error) {
    await writeClient
      .patch(verificationId)
      .set({ status: 'pending', updatedAt: new Date().toISOString() })
      .commit()
      .catch(() => undefined);
    console.error(`[${kind}] Merchant notification failed:`, error);
    throw new EnquiryError('Your email was verified, but the enquiry could not be delivered. Please try again.', 502);
  }

  await writeClient
    .patch(verificationId)
    .set({
      status: 'verified',
      verifiedAt: processingAt,
      updatedAt: new Date().toISOString(),
    })
    .unset(['email', 'codeHash'])
    .commit();

  return { success: true };
}

export async function cleanupExpiredVerifications(): Promise<number> {
  const now = new Date().toISOString();
  const cutoff = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
  const ids = await writeClient.fetch<string[]>(
    `*[
      (_type == "enquiryVerification" && expiresAt < $now) ||
      (_type == "enquiryVerificationEvent" && createdAt < $cutoff)
    ][]._id`,
    { now, cutoff },
  );
  if (ids.length === 0) return 0;

  for (let index = 0; index < ids.length; index += 100) {
    const transaction = writeClient.transaction();
    for (const id of ids.slice(index, index + 100)) transaction.delete(id);
    await transaction.commit();
  }
  return ids.length;
}
