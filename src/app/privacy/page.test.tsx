import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import PrivacyPage, { metadata } from './page';

describe('Facebook privacy and deletion instructions', () => {
  it('provides a public, directly addressable deletion section with the real support address', () => {
    const html = renderToStaticMarkup(PrivacyPage());
    expect(html).toContain('id="data-deletion"');
    expect(html).toContain('mailto:suryajewellersjaipur@gmail.com?subject=Account%20or%20Facebook%20data%20deletion%20request');
    expect(html).toContain('verify that you control the account');
    expect(metadata.alternates?.canonical).toBe('https://www.suryajewellers.com/privacy');
  });
  it('limits Facebook access and does not invent an automatic deletion workflow or deadline', () => {
    const html = renderToStaticMarkup(PrivacyPage());
    expect(html).toContain('basic profile and email access only');
    expect(html).toContain('not permission to send you marketing messages');
    expect(html).toContain('not by an automatic deletion button');
    expect(html).not.toMatch(/within \d+ (?:days|hours)/);
  });
});
