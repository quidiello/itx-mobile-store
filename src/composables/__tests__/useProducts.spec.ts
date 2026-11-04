import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, type EffectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { api } from '@/api'
import type { Api } from '@/api/client'
import { productSchema } from '@/api/schemas'
import list from '@/api/__tests__/fixtures/product-list.json'
import { useProducts } from '../useProducts'

vi.mock('@/api', () => ({ api: { getProducts: vi.fn<Api['getProducts']>() } }))

const getProducts = vi.mocked(api.getProducts)
const products = list.map((item) => productSchema.parse(item))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

const scopes: EffectScope[] = []

function run<T>(fn: () => T): T {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(fn)!
}

beforeEach(() => {
  getProducts.mockReset()
})

afterEach(() => {
  scopes.splice(0).forEach((scope) => scope.stop())
})

describe('useProducts', () => {
  it('starts loading, with no products and no error', () => {
    getProducts.mockReturnValue(new Promise(() => {}))

    const { products, loading, error } = run(() => useProducts())

    expect(loading.value).toBe(true)
    expect(products.value).toEqual([])
    expect(error.value).toBeNull()
  })

  it('requests the product list once', () => {
    getProducts.mockReturnValue(new Promise(() => {}))

    run(() => useProducts())

    expect(getProducts).toHaveBeenCalledTimes(1)
  })

  it('exposes the products once they are loaded', async () => {
    getProducts.mockResolvedValue(products)

    const result = run(() => useProducts())
    await flushPromises()

    expect(result.products.value).toEqual(products)
    expect(result.loading.value).toBe(false)
    expect(result.error.value).toBeNull()
  })

  it('exposes the error and no products when the request fails', async () => {
    getProducts.mockRejectedValue(new Error('network down'))

    const result = run(() => useProducts())
    await flushPromises()

    expect(result.error.value?.message).toBe('network down')
    expect(result.products.value).toEqual([])
    expect(result.loading.value).toBe(false)
  })

  it('requests the list again on reload and recovers from an error', async () => {
    getProducts.mockRejectedValueOnce(new Error('network down'))
    getProducts.mockResolvedValueOnce(products)

    const result = run(() => useProducts())
    await flushPromises()

    result.reload()
    expect(result.loading.value).toBe(true)
    expect(result.error.value).toBeNull()
    await flushPromises()

    expect(getProducts).toHaveBeenCalledTimes(2)
    expect(result.products.value).toEqual(products)
    expect(result.error.value).toBeNull()
    expect(result.loading.value).toBe(false)
  })

  it('ignores a late response from a request that a reload has replaced', async () => {
    const first = deferred<typeof products>()
    getProducts.mockReturnValueOnce(first.promise)
    getProducts.mockResolvedValueOnce(products.slice(0, 2))

    const result = run(() => useProducts())
    result.reload()
    await flushPromises()

    first.resolve(products)
    await flushPromises()

    expect(result.products.value).toHaveLength(2)
    expect(result.loading.value).toBe(false)
  })
})
