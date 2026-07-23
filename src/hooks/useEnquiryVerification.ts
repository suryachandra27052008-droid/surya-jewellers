'use client';

import { useCallback, useState } from 'react';
import type { RefObject } from 'react';
import type { TurnstileHandle } from '@/components/forms/Turnstile';

export type VerificationStage =
  | 'idle'
  | 'requesting'
  | 'awaiting-code'
  | 'verifying'
  | 'resending'
  | 'complete';

type VerificationResponse = {
  verificationId: string;
  maskedEmail: string;
  expiresAt: string;
  resendAfterSeconds: number;
};

type Options<T extends Record<string, unknown>> = {
  endpoint: string;
  getPayload: () => T;
  onVerified: () => void;
  turnstileRef: RefObject<TurnstileHandle | null>;
};

async function parseResponse(response: Response): Promise<Record<string, unknown>> {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.');
  }
  return data;
}

export function useEnquiryVerification<T extends Record<string, unknown>>({
  endpoint,
  getPayload,
  onVerified,
  turnstileRef,
}: Options<T>) {
  const [stage, setStage] = useState<VerificationStage>('idle');
  const [verificationId, setVerificationId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const applyChallenge = useCallback((data: VerificationResponse) => {
    setVerificationId(data.verificationId);
    setMaskedEmail(data.maskedEmail);
    setExpiresAt(data.expiresAt);
    setResendAvailableAt(Date.now() + data.resendAfterSeconds * 1000);
    setCode('');
    setStage('awaiting-code');
  }, []);

  const requestCode = useCallback(async () => {
    setError('');
    setStage('requesting');
    try {
      const turnstileToken = await turnstileRef.current?.execute();
      if (!turnstileToken) throw new Error('The security check is still loading. Please try again.');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...getPayload(),
          action: 'request-code',
          turnstileToken,
          website: honeypot,
        }),
      });
      applyChallenge((await parseResponse(response)) as unknown as VerificationResponse);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The code could not be sent.');
      setStage('idle');
    }
  }, [applyChallenge, endpoint, getPayload, honeypot, turnstileRef]);

  const verify = useCallback(async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit code from your email.');
      return;
    }
    setError('');
    setStage('verifying');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...getPayload(),
          action: 'verify',
          verificationId,
          code,
        }),
      });
      await parseResponse(response);
      setStage('complete');
      onVerified();
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'The code could not be verified.');
      setStage('awaiting-code');
    }
  }, [code, endpoint, getPayload, onVerified, verificationId]);

  const resend = useCallback(async () => {
    setError('');
    setStage('resending');
    try {
      const turnstileToken = await turnstileRef.current?.execute();
      if (!turnstileToken) throw new Error('The security check is still loading. Please try again.');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend-code',
          verificationId,
          turnstileToken,
        }),
      });
      applyChallenge((await parseResponse(response)) as unknown as VerificationResponse);
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : 'A new code could not be sent.');
      setStage('awaiting-code');
    }
  }, [applyChallenge, endpoint, turnstileRef, verificationId]);

  const reset = useCallback(() => {
    setStage('idle');
    setVerificationId('');
    setMaskedEmail('');
    setExpiresAt('');
    setResendAvailableAt(0);
    setCode('');
    setError('');
    turnstileRef.current?.reset();
  }, [turnstileRef]);

  return {
    stage,
    maskedEmail,
    expiresAt,
    resendAvailableAt,
    code,
    setCode: (value: string) => setCode(value.replace(/\D/g, '').slice(0, 6)),
    error,
    honeypot,
    setHoneypot,
    requestCode,
    verify,
    resend,
    reset,
    emailLocked: stage !== 'idle' && stage !== 'requesting',
    busy: stage === 'requesting' || stage === 'verifying' || stage === 'resending',
  };
}
