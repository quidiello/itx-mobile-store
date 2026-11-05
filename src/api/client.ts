import type { Cache } from '@/services/cache'
import {
  cartResponseSchema,
  productDetailSchema,
  productSchema,
  type Product,
  type ProductDetail,
} from './schemas'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface AddToCartPayload {
  id: string
  colorCode: number
  storageCode: number
}

export interface ApiOptions {
  cache: Cache
  baseUrl: string
}

export function createApi({ cache, baseUrl }: ApiOptions) {
  async function request(path: string, init?: RequestInit): Promise<unknown> {
    const headers = new Headers(init?.headers)
    headers.set('Accept', 'application/json')

    let response: Response
    try {
      response = await fetch(`${baseUrl}${path}`, { ...init, headers })
    } catch {
      throw new ApiError('Could not connect to the server')
    }
    if (!response.ok) {
      throw new ApiError(`Error ${response.status} calling ${path}`, response.status)
    }
    try {
      return await response.json()
    } catch {
      throw new ApiError(`Invalid response from ${path}`)
    }
  }

  function getProducts(): Promise<Product[]> {
    return cache.remember('products', async () => {
      const raw = await request('/api/product')
      if (!Array.isArray(raw)) throw new ApiError('Invalid product list response')

      const products = raw.flatMap((item) => {
        const parsed = productSchema.safeParse(item)
        if (parsed.success) return [parsed.data]
        console.warn('Product discarded because it does not match the API contract', parsed.error)
        return []
      })
      // A broken contract must not stay cached as an empty list for an hour.
      if (raw.length > 0 && products.length === 0) {
        throw new ApiError('Invalid product list response')
      }
      return products
    })
  }

  function getProduct(id: string): Promise<ProductDetail> {
    return cache.remember(`product:${id}`, async () => {
      const raw = await request(`/api/product/${encodeURIComponent(id)}`)
      const parsed = productDetailSchema.safeParse(raw)
      if (!parsed.success) throw new ApiError('Invalid product detail response')
      return parsed.data
    })
  }

  async function addToCart(payload: AddToCartPayload): Promise<number> {
    const raw = await request('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const parsed = cartResponseSchema.safeParse(raw)
    if (!parsed.success) throw new ApiError('Invalid cart response')
    return parsed.data.count
  }

  return { getProducts, getProduct, addToCart }
}

export type Api = ReturnType<typeof createApi>
