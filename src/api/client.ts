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
      throw new ApiError('No se pudo conectar con el servidor')
    }
    if (!response.ok) {
      throw new ApiError(`Error ${response.status} al llamar a ${path}`, response.status)
    }
    try {
      return await response.json()
    } catch {
      throw new ApiError(`Respuesta no válida de ${path}`)
    }
  }

  function getProducts(): Promise<Product[]> {
    return cache.remember('products', async () => {
      const raw = await request('/api/product')
      if (!Array.isArray(raw)) throw new ApiError('Respuesta de productos no válida')

      return raw.flatMap((item) => {
        const parsed = productSchema.safeParse(item)
        if (parsed.success) return [parsed.data]
        console.warn('Producto descartado por no cumplir el contrato del API', parsed.error)
        return []
      })
    })
  }

  function getProduct(id: string): Promise<ProductDetail> {
    return cache.remember(`product:${id}`, async () => {
      const raw = await request(`/api/product/${encodeURIComponent(id)}`)
      const parsed = productDetailSchema.safeParse(raw)
      if (!parsed.success) throw new ApiError('Detalle de producto no válido')
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
    if (!parsed.success) throw new ApiError('Respuesta de la cesta no válida')
    return parsed.data.count
  }

  return { getProducts, getProduct, addToCart }
}

export type Api = ReturnType<typeof createApi>
