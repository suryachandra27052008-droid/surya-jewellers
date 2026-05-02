import { defineField, defineType } from 'sanity';

export const order = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({ name: 'razorpayOrderId', title: 'Razorpay Order ID', type: 'string' }),
    defineField({ name: 'razorpayPaymentId', title: 'Razorpay Payment ID', type: 'string' }),
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'object',
      fields: [
        defineField({ name: 'name', type: 'string', title: 'Name' }),
        defineField({ name: 'email', type: 'string', title: 'Email' }),
        defineField({ name: 'phone', type: 'string', title: 'Phone' }),
        defineField({ name: 'address', type: 'text', title: 'Address' }),
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
