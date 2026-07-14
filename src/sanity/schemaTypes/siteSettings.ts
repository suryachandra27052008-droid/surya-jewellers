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
    defineField({
      name: 'couponEnabled',
      title: 'Enable Personal Coupon',
      type: 'boolean',
    }),
    defineField({
      name: 'couponCode',
      title: 'Coupon Code',
      type: 'string',
    }),
    defineField({
      name: 'couponName',
      title: 'Coupon Label',
      type: 'string',
    }),
    defineField({
      name: 'couponDiscountPercent',
      title: 'Coupon Discount (%)',
      type: 'number',
    }),
    defineField({
      name: 'couponCustomerEmail',
      title: 'Assigned Customer Email',
      type: 'string',
    }),
    defineField({
      name: 'couponStartDate',
      title: 'Coupon Start Date',
      type: 'string',
    }),
    defineField({
      name: 'couponEndDate',
      title: 'Coupon End Date',
      type: 'string',
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp Number',
      type: 'string',
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram Handle',
      type: 'string',
    }),
  ],
});
