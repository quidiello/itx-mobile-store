import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref, type EffectScope, type Ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { api } from '@/api'
import type { Api } from '@/api/client'
import { productDetailSchema } from '@/api/schemas'
import details from '@/api/__tests__/fixtures/product-details.json'
import { useProduct } from '../useProduct'

vi.mock('@/api', () => ({ api: { getProduct: vi.fn<Api['getProduct']>() } }))

const getProduct = vi.mocked(api.getProduct)
const base = productDetailSchema.parse(details.normal)
const productWith = (id: string) => ({ ...base, id })

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const scopes: EffectScope[] = []

function run<T>(fn: () => T): T {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(fn)!
}

beforeEach(() => {
  getProduct.mockReset()
})

afterEach(() => {
  scopes.splice(0).forEach((scope) => scope.stop())
})

describe('useProduct', () => {
  it('starts loading, without product and without error', () => {
    getProduct.mockReturnValue(new Promise(() => {}))

    const { product, loading, error } = run(() => useProduct('p1'))

    expect(loading.value).toBe(true)
    expect(product.value).toBeNull()
    expect(error.value).toBeNull()
  })

  it('requests the given product', () => {
    getProduct.mockReturnValue(new Promise(() => {}))

    run(() => useProduct('p1'))

    expect(getProduct).toHaveBeenCalledWith('p1')
  })

  it('exposes the product once it is loaded', async () => {
    getProduct.mockResolvedValue(productWith('p1'))

    const { product, loading, error } = run(() => useProduct('p1'))
    await flushPromises()

    expect(product.value).toEqual(productWith('p1'))
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('exposes the error and no product when the request fails', async () => {
    getProduct.mockRejectedValue(new Error('network down'))

    const { product, loading, error } = run(() => useProduct('p1'))
    await flushPromises()

    expect(error.value?.message).toBe('network down')
    expect(product.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('requests the product again on reload and recovers from an error', async () => {
    getProduct.mockRejectedValueOnce(new Error('network down'))
    getProduct.mockResolvedValueOnce(productWith('p1'))

    const { product, loading, error, reload } = run(() => useProduct('p1'))
    await flushPromises()

    reload()
    expect(loading.value).toBe(true)
    expect(error.value).toBeNull()
    await flushPromises()

    expect(getProduct).toHaveBeenCalledTimes(2)
    expect(product.value).toEqual(productWith('p1'))
    expect(error.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  describe.each([
    ['a ref', (id: Ref<string>) => id],
    ['a getter', (id: Ref<string>) => () => id.value],
  ])('when the id is %s', (_, toSource) => {
    it('loads the new product and clears the previous one when the id changes', async () => {
      const second = deferred<ReturnType<typeof productWith>>()
      getProduct.mockResolvedValueOnce(productWith('p1'))
      getProduct.mockReturnValueOnce(second.promise)
      const id = ref('p1')

      const { product, loading } = run(() => useProduct(toSource(id)))
      await flushPromises()
      expect(product.value?.id).toBe('p1')

      id.value = 'p2'
      await nextTick()
      expect(getProduct).toHaveBeenLastCalledWith('p2')
      expect(product.value).toBeNull()
      expect(loading.value).toBe(true)

      second.resolve(productWith('p2'))
      await flushPromises()
      expect(product.value?.id).toBe('p2')
      expect(loading.value).toBe(false)
    })
  })

  it('ignores a late response for a previous id', async () => {
    const first = deferred<ReturnType<typeof productWith>>()
    const second = deferred<ReturnType<typeof productWith>>()
    getProduct.mockReturnValueOnce(first.promise)
    getProduct.mockReturnValueOnce(second.promise)
    const id = ref('p1')

    const { product, loading } = run(() => useProduct(id))
    id.value = 'p2'
    await nextTick()

    second.resolve(productWith('p2'))
    await flushPromises()
    first.resolve(productWith('p1'))
    await flushPromises()

    expect(product.value?.id).toBe('p2')
    expect(loading.value).toBe(false)
  })

  it('ignores a late error for a previous id', async () => {
    const first = deferred<ReturnType<typeof productWith>>()
    getProduct.mockReturnValueOnce(first.promise)
    getProduct.mockResolvedValueOnce(productWith('p2'))
    const id = ref('p1')

    const { product, error } = run(() => useProduct(id))
    id.value = 'p2'
    await flushPromises()

    first.reject(new Error('too late'))
    await flushPromises()

    expect(product.value?.id).toBe('p2')
    expect(error.value).toBeNull()
  })
})
