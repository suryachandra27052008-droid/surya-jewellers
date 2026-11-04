export function getSocialAuthError(error: unknown, provider: 'oauth_google' | 'oauth_facebook') {
  const errors = (error as { errors?: Array<{ code?: string; longMessage?: string; long_message?: string }> } | null)?.errors;
  const unavailable = errors?.some(item => item.code === 'form_param_value_invalid' &&
    /strategy|oauth_facebook|oauth_google/i.test(item.longMessage || item.long_message || ''));
  const name = provider === 'oauth_facebook' ? 'Facebook' : 'Google';
  if (unavailable) return `${name} sign-in is currently unavailable. Please use ${name === 'Facebook' ? 'Google or email' : 'email'} to continue.`;
  return `${name} sign-in could not be completed. Please try again or use your email.`;
}
