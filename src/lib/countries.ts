import * as countries from 'i18n-iso-countries';
import english from 'i18n-iso-countries/langs/en.json';
import isPostalCode, { locales } from 'validator/lib/isPostalCode';

countries.registerLocale(english);
export const COUNTRIES = Object.entries(countries.getNames('en')).map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function countryCode(value: unknown): string {
  if (typeof value !== 'string') return '';
  const input = value.trim();
  const code = input.toUpperCase();
  if (code === 'UK') return 'GB';
  if (code === 'BHARAT') return 'IN';
  if (/^[A-Z]{2}$/.test(code) && countries.isValid(code)) return code;
  return countries.alpha3ToAlpha2(code) || countries.getAlpha2Code(input, 'en') || '';
}

export function countryName(value: unknown) {
  return countries.getName(countryCode(value), 'en') || '';
}

export function postalCodeRequired(value: unknown) {
  const code = countryCode(value);
  return locales.includes(code);
}

export function postalCodeError(country: unknown, postal: unknown) {
  const code = countryCode(country);
  if (!code) return 'Choose a valid delivery country.';
  const value = typeof postal === 'string' ? postal.trim() : '';
  if (!postalCodeRequired(code)) return value.length <= 20 ? '' : 'Postal code is too long.';
  return isPostalCode(value, code) ? '' : `Enter a valid postal code for ${countryName(code)}.`;
}
