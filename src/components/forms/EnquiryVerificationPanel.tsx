'use client';

import { useEffect, useState } from 'react';
import type { VerificationStage } from '@/hooks/useEnquiryVerification';

type Props = {
  stage: VerificationStage;
  maskedEmail: string;
  expiresAt: string;
  resendAvailableAt: number;
  code: string;
  error: string;
  honeypot: string;
  onCodeChange: (value: string) => void;
  onHoneypotChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
};

export function EnquiryVerificationPanel({
  stage,
  maskedEmail,
  expiresAt,
  resendAvailableAt,
  code,
  error,
  honeypot,
  onCodeChange,
  onHoneypotChange,
  onVerify,
  onResend,
  onChangeEmail,
}: Props) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (stage !== 'awaiting-code' && stage !== 'verifying' && stage !== 'resending') return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);

  const resendSeconds = now === 0 ? 60 : Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));
  const isCodeStage = stage === 'awaiting-code' || stage === 'verifying' || stage === 'resending';
  const expired = Boolean(expiresAt) && new Date(expiresAt).getTime() <= now;

  return (
    <>
      <div hidden aria-hidden="true">
        <label htmlFor="enquiry-website">Website</label>
        <input
          id="enquiry-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => onHoneypotChange(event.target.value)}
        />
      </div>

      {isCodeStage && (
        <div className="border border-gold/25 bg-gold/5 p-4 sm:p-5 rounded-sm" aria-live="polite">
          <p className="text-white/75 text-sm mb-1">We sent a six-digit code to {maskedEmail}.</p>
          <p className="text-white/40 text-xs mb-4">
            Verify the address to deliver your enquiry. The code expires after 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="verificationCode"
              aria-label="Six-digit email verification code"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => onCodeChange(event.target.value)}
              placeholder="000000"
              className="w-full sm:w-44 bg-white/5 border border-white/15 rounded-sm px-4 py-3 text-white text-center text-lg tracking-[0.35em] placeholder-white/20 focus:outline-none focus:border-gold/60"
            />
            <button
              type="button"
              onClick={onVerify}
              disabled={stage !== 'awaiting-code' || code.length !== 6 || expired}
              className="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stage === 'verifying' ? 'Verifying...' : 'Verify & Send'}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs">
            <button
              type="button"
              onClick={onResend}
              disabled={stage !== 'awaiting-code' || resendSeconds > 0}
              className="text-gold hover:text-gold-light disabled:text-white/30 disabled:cursor-not-allowed"
            >
              {stage === 'resending'
                ? 'Sending...'
                : resendSeconds > 0
                  ? `Resend code in ${resendSeconds}s`
                  : 'Resend code'}
            </button>
            <button
              type="button"
              onClick={onChangeEmail}
              disabled={stage === 'verifying' || stage === 'resending'}
              className="text-white/50 hover:text-white disabled:opacity-40"
            >
              Change email
            </button>
            {expired && <span className="text-red-300/80">Code expired. Request a new code.</span>}
          </div>
        </div>
      )}

      {error && (
        <p role="alert" aria-live="assertive" className="text-red-300/90 text-sm">
          {error}
        </p>
      )}
    </>
  );
}
