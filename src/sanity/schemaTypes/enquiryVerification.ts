import { defineField, defineType } from 'sanity';

export const enquiryVerification = defineType({
  name: 'enquiryVerification',
  title: 'Enquiry Verification',
  type: 'document',
  hidden: true,
  fields: [
    defineField({ name: 'kind', type: 'string' }),
    defineField({ name: 'email', type: 'string' }),
    defineField({ name: 'emailHash', type: 'string' }),
    defineField({ name: 'ipHash', type: 'string' }),
    defineField({ name: 'codeHash', type: 'string' }),
    defineField({ name: 'status', type: 'string' }),
    defineField({ name: 'attempts', type: 'number' }),
    defineField({ name: 'sendCount', type: 'number' }),
    defineField({ name: 'createdAt', type: 'datetime' }),
    defineField({ name: 'updatedAt', type: 'datetime' }),
    defineField({ name: 'lastSentAt', type: 'datetime' }),
    defineField({ name: 'expiresAt', type: 'datetime' }),
    defineField({ name: 'verifiedAt', type: 'datetime' }),
  ],
});

export const enquiryVerificationEvent = defineType({
  name: 'enquiryVerificationEvent',
  title: 'Enquiry Verification Rate Event',
  type: 'document',
  hidden: true,
  fields: [
    defineField({ name: 'verificationId', type: 'string' }),
    defineField({ name: 'emailHash', type: 'string' }),
    defineField({ name: 'ipHash', type: 'string' }),
    defineField({ name: 'createdAt', type: 'datetime' }),
  ],
});

