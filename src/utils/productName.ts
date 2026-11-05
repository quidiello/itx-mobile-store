interface Named {
  brand: string | null
  model: string | null
}

export function productName(product: Named | null | undefined) {
  return [product?.brand, product?.model].filter(Boolean).join(' ') || 'Product'
}
