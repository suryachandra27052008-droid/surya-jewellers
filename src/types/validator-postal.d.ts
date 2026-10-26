declare module 'validator/lib/isPostalCode' {
  export default function isPostalCode(value: string, locale: string): boolean;
  export const locales: string[];
}
