/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/react/legacy';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const GOLD = '#8B6914';
const INPUT_BG = '#f0ebe3';
const INPUT_BORDER = '#ddd5c8';
const BG = '#f5f0eb';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.403 18.627 0 12 0S0 5.403 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        setError('Sign in could not be completed. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'oauth_google' | 'oauth_facebook') {
    if (!isLoaded) return;
    setOauthLoading(provider === 'oauth_google' ? 'google' : 'facebook');
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch {
      setError('OAuth sign-in failed. Please try again.');
      setOauthLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: BG }}>
      <div
        className="w-full max-w-md bg-white rounded-2xl px-8 py-10"
        style={{ boxShadow: '0 4px 24px rgba(139,105,20,0.08), 0 1px 4px rgba(0,0,0,0.06)' }}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <Image src="/logo_sj.webp" alt="Surya Jewellers" width={40} height={40} className="opacity-90" />
            <span
              className="text-[11px] tracking-[0.35em] font-semibold uppercase"
              style={{ color: GOLD }}
            >
              Surya Jewellers
            </span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="font-serif text-[1.75rem] font-semibold text-gray-900 leading-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg px-4 py-2.5 text-sm text-gray-800 outline-none transition-all duration-200"
              style={{
                backgroundColor: INPUT_BG,
                border: `1px solid ${INPUT_BORDER}`,
              }}
              onFocus={(e) => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px rgba(139,105,20,0.1)`; }}
              onBlur={(e) => { e.target.style.borderColor = INPUT_BORDER; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-2.5 pr-11 text-sm text-gray-800 outline-none transition-all duration-200"
                style={{
                  backgroundColor: INPUT_BG,
                  border: `1px solid ${INPUT_BORDER}`,
                }}
                onFocus={(e) => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px rgba(139,105,20,0.1)`; }}
                onBlur={(e) => { e.target.style.borderColor = INPUT_BORDER; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5 w-[18px] h-[18px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#8B6914]"
              />
              <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
            </label>
            <Link
              href="/sign-in/forgot-password"
              className="text-xs font-medium transition-colors"
              style={{ color: GOLD }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white tracking-wide transition-all duration-200 mt-2 disabled:opacity-60"
            style={{
              backgroundColor: GOLD,
              boxShadow: '0 2px 8px rgba(139,105,20,0.25)',
            }}
            onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#7a5c12'; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = GOLD; }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">Or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuth('oauth_google')}
            disabled={oauthLoading !== null || !isLoaded}
            className="flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-60"
          >
            {oauthLoading === 'google' ? (
              <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Google
          </button>
          <button
            onClick={() => handleOAuth('oauth_facebook')}
            disabled={oauthLoading !== null || !isLoaded}
            className="flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-60"
          >
            {oauthLoading === 'facebook' ? (
              <span className="w-4 h-4 border-2 border-gray-300 border-t-[#1877F2] rounded-full animate-spin" />
            ) : (
              <FacebookIcon />
            )}
            Facebook
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500 mt-7">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-medium transition-colors" style={{ color: GOLD }}>
            Sign up
          </Link>
        </p>

        {/* Terms */}
        <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-gray-600 transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-gray-600 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
