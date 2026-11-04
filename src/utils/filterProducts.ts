import type { Product } from '@/api/schemas'

function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function filterProducts(products: Product[], query: string): Product[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return products

  return products.filter((product) => {
    const name = normalize(`${product.brand ?? ''} ${product.model ?? ''}`)
    return terms.every((term) => name.includes(term))
  })
}
