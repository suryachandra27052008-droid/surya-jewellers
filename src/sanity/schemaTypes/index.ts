import { category } from './category';
import { product } from './product';
import { order } from './order';
import { siteSettings } from './siteSettings';
import { enquiryVerification, enquiryVerificationEvent } from './enquiryVerification';

export const schemaTypes = [
  category,
  product,
  order,
  siteSettings,
  enquiryVerification,
  enquiryVerificationEvent,
];
