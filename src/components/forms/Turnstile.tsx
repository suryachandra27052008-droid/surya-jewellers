'use client';

import Script from 'next/script';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

const TEST_SITE_KEY = '1x00000000000000000000AA';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      execution: 'execute';
      appearance: 'interaction-only';
      callback: (token: string) => void;
      'error-callback': () => void;
      'expired-callback': () => void;
      'timeout-callback': () => void;
    },
  ) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = {
  execute: () => Promise<string>;
  reset: () => void;
};

type Props = {
  action: string;
};

export const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ action }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const resolverRef = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const settleError = useCallback((message: string) => {
    const resolver = resolverRef.current;
    if (!resolver) return;
    clearTimeout(resolver.timer);
    resolver.reject(new Error(message));
    resolverRef.current = null;
  }, []);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return widgetIdRef.current;
    const configuredKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const sitekey = configuredKey || (process.env.NODE_ENV !== 'production' ? TEST_SITE_KEY : '');
    if (!sitekey) return null;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey,
      action,
      execution: 'execute',
      appearance: 'interaction-only',
      callback: (token) => {
        const resolver = resolverRef.current;
        if (!resolver) return;
        clearTimeout(resolver.timer);
        resolver.resolve(token);
        resolverRef.current = null;
      },
      'error-callback': () => settleError('The security check failed. Please try again.'),
      'expired-callback': () => settleError('The security check expired. Please try again.'),
      'timeout-callback': () => settleError('The security check timed out. Please try again.'),
    });
    return widgetIdRef.current;
  }, [action, settleError]);

  useEffect(() => {
    if (window.turnstile) {
      setScriptReady(true);
      renderWidget();
    }
  }, [renderWidget]);

  useEffect(() => {
    if (scriptReady) renderWidget();
  }, [renderWidget, scriptReady]);

  useEffect(
    () => () => {
      if (resolverRef.current) settleError('The security check was cancelled.');
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    },
    [settleError],
  );

  useImperativeHandle(
    ref,
    () => ({
      execute: () =>
        new Promise<string>((resolve, reject) => {
          if (resolverRef.current) {
            reject(new Error('A security check is already running.'));
            return;
          }
          const widgetId = renderWidget();
          if (!widgetId || !window.turnstile) {
            reject(new Error('The security check is still loading. Please try again in a moment.'));
            return;
          }
          window.turnstile.reset(widgetId);
          resolverRef.current = {
            resolve,
            reject,
            timer: setTimeout(
              () => settleError('The security check timed out. Please try again.'),
              15_000,
            ),
          };
          window.turnstile.execute(widgetId);
        }),
      reset: () => {
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
      },
    }),
    [renderWidget, settleError],
  );

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="min-h-0" aria-hidden="true" />
    </>
  );
});

