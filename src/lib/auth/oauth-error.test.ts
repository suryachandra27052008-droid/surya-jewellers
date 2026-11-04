import { describe, expect, it } from 'vitest';
import { getSocialAuthError } from './oauth-error';

describe('social sign-in errors', () => {
  it('explains the reproduced disabled Facebook strategy without exposing provider details', () => {
    const error = { errors: [{ code: 'form_param_value_invalid', longMessage: 'oauth_facebook does not match one of the allowed values for parameter strategy' }] };
    expect(getSocialAuthError(error, 'oauth_facebook')).toBe('Facebook sign-in is currently unavailable. Please use Google or email to continue.');
  });
  it('provides retryable, nontechnical messages for both providers', () => {
    expect(getSocialAuthError(null, 'oauth_google')).toContain('try again or use your email');
    expect(getSocialAuthError(new Error('private provider information'), 'oauth_facebook')).not.toContain('private');
  });
});
