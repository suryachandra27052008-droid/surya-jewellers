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
