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
    defineField({
      name: 'saleEnabled',
      title: 'Enable Seasonal Sale',
      type: 'boolean',
    }),
    defineField({
      name: 'saleName',
      title: 'Sale Name',
      type: 'string',
    }),
    defineField({
      name: 'saleDiscountPercent',
      title: 'Sale Discount (%)',
      type: 'number',
    }),
    defineField({
      name: 'saleStartDate',
      title: 'Sale Start Date',
      type: 'string',
    }),
    defineField({
      name: 'saleEndDate',
      title: 'Sale End Date',
      type: 'string',
    }),
    defineField({
      name: 'showSaleBanner',
      title: 'Show Sale Banner',
      type: 'boolean',
    }),
  ],
});
