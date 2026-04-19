import { defineField, defineType } from 'sanity';

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (INR)',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'silverWeight',
      title: 'Silver Weight (grams)',
      type: 'number',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'mainStoneType',
      title: 'Main Stone Type',
      type: 'string',
      options: {
        list: [
          { title: 'Diamond', value: 'Diamond' },
          { title: 'Ruby', value: 'Ruby' },
          { title: 'Emerald', value: 'Emerald' },
          { title: 'Sapphire', value: 'Sapphire' },
          { title: 'None', value: 'None' },
        ],
      },
    }),
    defineField({
      name: 'totalCaratWeight',
      title: 'Total Carat Weight',
      type: 'number',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'diamondColorClarity',
      title: 'Diamond Color & Clarity',
      type: 'string',
      description: 'e.g., G/VS1, F/VVS2',
    }),
    defineField({
      name: 'secondaryStoneType',
      title: 'Secondary Stone Type',
      type: 'string',
      description: 'e.g., Yellow Sapphire, Coral',
    }),
    defineField({
      name: 'csWeight',
      title: 'Colored Stone Weight (ct)',
      type: 'number',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'diamondWeight',
      title: 'Diamond Weight (ct)',
      type: 'number',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'grossWeight',
      title: 'Gross Weight (g)',
      type: 'number',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'allStones',
      title: 'All Stones',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'All gemstones present in this piece',
    }),
    defineField({
      name: 'barcode',
      title: 'Barcode',
      type: 'string',
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      description: 'Maximum number of pieces a customer can buy. Default is 1.',
      initialValue: 1,
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'price',
      media: 'images.0',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `₹${subtitle.toLocaleString('en-IN')}` : '',
        media,
      };
    },
  },
});
