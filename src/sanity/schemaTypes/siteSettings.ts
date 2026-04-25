import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'showFreeShippingBanner',
      title: 'Show Free Shipping Banner',
      type: 'boolean',
    }),
    defineField({
      name: 'freeShippingEndDate',
      title: 'Free Shipping End Date',
      type: 'string',
    }),
    defineField({
      name: 'freeShippingMinOrder',
      title: 'Free Shipping Min Order (₹)',
      type: 'number',
    }),
  ],
});
