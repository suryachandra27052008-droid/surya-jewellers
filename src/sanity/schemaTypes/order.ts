import { defineField, defineType } from 'sanity';

export const order = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({ name: 'ownerUserId', title: 'Customer Account ID', type: 'string', readOnly: true }),
    defineField({ name: 'checkoutVersion', title: 'Checkout Version', type: 'number', readOnly: true }),
    defineField({ name: 'courier', title: 'Courier', type: 'string' }),
    defineField({ name: 'trackingNumber', title: 'Tracking Number', type: 'string' }),
    defineField({ name: 'trackingUrl', title: 'Tracking URL', type: 'url', validation: rule => rule.uri({ scheme: ['https'] }) }),
    defineField({ name: 'internalNotes', title: 'Internal Notes (Never Shared with Customer)', type: 'text' }),
    defineField({ name: 'fulfillmentBlocked', title: 'Dispatch Blocked - Stock Review', type: 'boolean', readOnly: true }),
    defineField({ name: 'processingError', title: 'Order Processing Alert', type: 'string', readOnly: true }),
    defineField({ name: 'notificationError', title: 'Email Alert', type: 'string', readOnly: true }),
    defineField({ name: 'razorpayOrderId', title: 'Razorpay Order ID', type: 'string' }),
    defineField({ name: 'razorpayPaymentId', title: 'Razorpay Payment ID', type: 'string' }),
    defineField({ name: 'paymentMethod', title: 'Payment Provider', type: 'string' }),
    defineField({ name: 'paymentCurrency', title: 'Payment Currency', type: 'string' }),
    defineField({ name: 'paymentAmount', title: 'Payment Amount', type: 'string' }),
    defineField({ name: 'paymentStatus', title: 'Provider Payment Status', type: 'string' }),
    defineField({ name: 'paymentPendingReason', title: 'Pending Reason', type: 'string' }),
    defineField({ name: 'needsMerchantReview', title: 'Contact or Shipping Details Need Review', type: 'boolean' }),
    defineField({ name: 'orderConfirmationSentAt', title: 'Order Confirmation Sent At', type: 'datetime' }),
    defineField({ name: 'orderConfirmationEmailId', title: 'Confirmation Email ID', type: 'string' }),
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'object',
      fields: [
        defineField({ name: 'name', type: 'string', title: 'Name' }),
        defineField({ name: 'email', type: 'string', title: 'Email' }),
        defineField({ name: 'phone', type: 'string', title: 'Phone' }),
        defineField({ name: 'address', type: 'text', title: 'Address' }),
        defineField({ name: 'country', type: 'string', title: 'Country' }),
      ],
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'productId', type: 'string', title: 'Product ID' }),
            defineField({ name: 'name', type: 'string', title: 'Name' }),
            defineField({ name: 'price', type: 'number', title: 'Price' }),
            defineField({ name: 'quantity', type: 'number', title: 'Quantity' }),
            defineField({ name: 'category', type: 'string', title: 'Category' }),
            defineField({ name: 'ringSize', type: 'number', title: 'Ring Size (India)', validation: rule => rule.integer().min(5).max(20) }),
          ],
        },
      ],
    }),
    defineField({ name: 'subtotal', title: 'Subtotal (INR)', type: 'number' }),
    defineField({
      name: 'discount',
      title: 'Discount Applied',
      type: 'object',
      fields: [
        defineField({ name: 'name', type: 'string', title: 'Sale Name' }),
        defineField({ name: 'percent', type: 'number', title: 'Discount Percent' }),
        defineField({ name: 'amount', type: 'number', title: 'Discount Amount (INR)' }),
        defineField({ name: 'subtotalBeforeDiscount', type: 'number', title: 'Subtotal Before Discount (INR)' }),
        defineField({ name: 'code', type: 'string', title: 'Coupon Code' }),
        defineField({ name: 'type', type: 'string', title: 'Discount Type' }),
      ],
    }),
    defineField({ name: 'shipping', title: 'Shipping (INR)', type: 'number' }),
    defineField({ name: 'total', title: 'Total (INR)', type: 'number' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Paid', value: 'paid' },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Pending', value: 'pending' },
          { title: 'Failed', value: 'failed' },
        ],
      },
      initialValue: 'paid',
    }),
    defineField({ name: 'paidAt', title: 'Paid At', type: 'datetime' }),
  ],
  preview: {
    select: {
      title: 'razorpayPaymentId',
      subtitle: 'total',
      status: 'status',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Unknown Payment',
        subtitle: subtitle ? `₹${Number(subtitle).toLocaleString('en-IN')}` : '',
      };
    },
  },
});
