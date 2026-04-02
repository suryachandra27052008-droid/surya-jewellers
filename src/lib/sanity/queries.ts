export const ALL_PRODUCTS_QUERY = `*[_type == "product"] | order(_createdAt desc) {
  _id,
  name,
  slug,
  sku,
  price,
  "category": category->{name, slug},
  silverWeight,
  mainStoneType,
  totalCaratWeight,
  diamondColorClarity,
  images,
  description,
  featured,
  inStock
}`;

export const FEATURED_PRODUCTS_QUERY = `*[_type == "product" && featured == true] | order(_createdAt desc) [0...8] {
  _id,
  name,
  slug,
  price,
  "category": category->{name, slug},
  mainStoneType,
  images,
  inStock
}`;

export const PRODUCT_BY_SLUG_QUERY = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  sku,
  price,
  "category": category->{name, slug},
  silverWeight,
  mainStoneType,
  totalCaratWeight,
  diamondColorClarity,
  images,
  description,
  featured,
  inStock
}`;

export const ALL_CATEGORIES_QUERY = `*[_type == "category"] | order(name asc) {
  _id,
  name,
  slug,
  description,
  image
}`;

export const PRODUCTS_BY_CATEGORY_QUERY = `*[_type == "product" && category->slug.current == $categorySlug] | order(_createdAt desc) {
  _id,
  name,
  slug,
  price,
  "category": category->{name, slug},
  mainStoneType,
  images,
  inStock
}`;
