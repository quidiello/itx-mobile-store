import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { createCache } from '@/services/cache'
import { ApiError, createApi } from '../client'
import details from './fixtures/product-details.json'
import list from './fixtures/product-list.json'

const BASE_URL = 'https://api.test'

let fetchMock: Mock<typeof fetch>

function respondWith(body: unknown, status = 200) {
  fetchMock.mockImplementation(() =>
    Promise.resolve(new Response(JSON.stringify(body), { status })),
  )
}

function requestAt(index = 0) {
  const [url, init] = fetchMock.mock.calls[index]!
  return { url, init, headers: new Headers(init?.headers) }
}

function createTestApi() {
  return createApi({
    cache: createCache({ ttlMs: 60 * 60 * 1000, prefix: 'test:' }),
    baseUrl: BASE_URL,
  })
}

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('getProducts', () => {
  it('requests the product list from the configured base URL asking for JSON', async () => {
    respondWith(list)

    await createTestApi().getProducts()

    const { url, headers } = requestAt()
    expect(url).toBe(`${BASE_URL}/api/product`)
    expect(headers.get('Accept')).toBe('application/json')
  })

  it('returns the products normalized', async () => {
    respondWith(list)

    const products = await createTestApi().getProducts()

    expect(products).toHaveLength(list.length)
    expect(products[0]?.price).toBe(170)
    expect(products[products.length - 1]?.price).toBeNull()
  })

  it('serves the second call from the cache', async () => {
    respondWith(list)
    const api = createTestApi()

    await api.getProducts()
    await api.getProducts()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('discards a product that fails validation, keeps the rest and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    respondWith([...list.slice(0, 2), { brand: 'Missing id' }])

    const products = await createTestApi().getProducts()

    expect(products).toHaveLength(2)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('throws an ApiError when none of the products matches the contract', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    respondWith([{ brand: 'Missing id' }, { model: 'Also missing' }])

    await expect(createTestApi().getProducts()).rejects.toBeInstanceOf(ApiError)
  })

  it('does not cache a list in which nothing matched the contract', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const api = createTestApi()
    respondWith([{ brand: 'Missing id' }])
    await expect(api.getProducts()).rejects.toBeInstanceOf(ApiError)

    respondWith(list)
    const products = await api.getProducts()

    expect(products.length).toBeGreaterThan(0)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('still accepts an empty list when the server really has no products', async () => {
    respondWith([])

    await expect(createTestApi().getProducts()).resolves.toEqual([])
  })

  it('throws an ApiError when the response is not a list', async () => {
    respondWith({ products: [] })

    await expect(createTestApi().getProducts()).rejects.toBeInstanceOf(ApiError)
  })

  it('throws an ApiError carrying the status when the server responds with an error', async () => {
    respondWith({}, 500)

    await expect(createTestApi().getProducts()).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    })
  })

  it('throws an ApiError when the network request fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(createTestApi().getProducts()).rejects.toBeInstanceOf(ApiError)
  })

  it('throws an ApiError when the body is not valid JSON', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(new Response('<html>', { status: 200 })))

    await expect(createTestApi().getProducts()).rejects.toBeInstanceOf(ApiError)
  })

  it('does not cache a failed request and asks again on the next call', async () => {
    const api = createTestApi()

    respondWith({}, 500)
    await expect(api.getProducts()).rejects.toBeInstanceOf(ApiError)

    respondWith(list)
    await expect(api.getProducts()).resolves.toHaveLength(list.length)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('getProduct', () => {
  it('requests the product by id', async () => {
    respondWith(details.normal)

    await createTestApi().getProduct(details.normal.id)

    expect(requestAt().url).toBe(`${BASE_URL}/api/product/${details.normal.id}`)
  })

  it('encodes the id in the URL', async () => {
    respondWith({ id: 'a/b c' })

    await createTestApi().getProduct('a/b c')

    expect(requestAt().url).toBe(`${BASE_URL}/api/product/a%2Fb%20c`)
  })

  it('returns the detail normalized', async () => {
    respondWith(details.normal)

    const product = await createTestApi().getProduct(details.normal.id)

    expect(product.price).toBe(170)
    expect(product.screenSize).toContain('inches')
    expect(product.options.storages).toHaveLength(2)
  })

  it('caches each product by id', async () => {
    respondWith(details.normal)
    const api = createTestApi()

    await api.getProduct('one')
    await api.getProduct('one')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await api.getProduct('two')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws an ApiError when the detail has no id', async () => {
    respondWith({ brand: 'Acer' })

    await expect(createTestApi().getProduct('p1')).rejects.toBeInstanceOf(ApiError)
  })

  it('throws an ApiError carrying the status when the product does not exist', async () => {
    respondWith({}, 404)

    await expect(createTestApi().getProduct('missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    })
  })
})

describe('addToCart', () => {
  const payload = { id: 'p1', colorCode: 1000, storageCode: 2000 }

  it('sends the selection as a JSON POST', async () => {
    respondWith({ count: 1 })

    await createTestApi().addToCart(payload)

    const { url, init, headers } = requestAt()
    expect(url).toBe(`${BASE_URL}/api/cart`)
    expect(init?.method).toBe('POST')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Accept')).toBe('application/json')
    expect(JSON.parse(init?.body as string)).toEqual(payload)
  })

  it('returns the number of products in the cart', async () => {
    respondWith({ count: 3 })

    await expect(createTestApi().addToCart(payload)).resolves.toBe(3)
  })

  it('always hits the API instead of using the cache', async () => {
    respondWith({ count: 1 })
    const api = createTestApi()

    await api.addToCart(payload)
    await api.addToCart(payload)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws an ApiError when the response has no valid count', async () => {
    respondWith({ count: -1 })

    await expect(createTestApi().addToCart(payload)).rejects.toBeInstanceOf(ApiError)
  })

  it('throws an ApiError carrying the status when the server responds with an error', async () => {
    respondWith({}, 500)

    await expect(createTestApi().addToCart(payload)).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    })
  })
})
