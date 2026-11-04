import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { config } from '@/config'
import list from './fixtures/product-list.json'

let fetchMock: Mock<typeof fetch>
let storage: ReturnType<typeof createMemoryStorage>

function createMemoryStorage() {
  const items = new Map<string, string>()
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value)
    },
    removeItem: (key: string) => {
      items.delete(key)
    },
  }
}

async function loadApi() {
  vi.resetModules()
  return (await import('../index')).api
}

beforeEach(() => {
  storage = createMemoryStorage()
  fetchMock = vi.fn<typeof fetch>(() =>
    Promise.resolve(new Response(JSON.stringify(list), { status: 200 })),
  )
  vi.stubGlobal('localStorage', storage)
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api', () => {
  it('requests the API at the configured base URL', async () => {
    const api = await loadApi()

    await api.getProducts()

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${config.apiBaseUrl}/api/product`)
  })

  it('keeps the responses in localStorage under the configured prefix', async () => {
    const api = await loadApi()

    await api.getProducts()

    expect(storage.getItem(`${config.cachePrefix}products`)).not.toBeNull()
  })

  it('serves a second call from the cache', async () => {
    const api = await loadApi()

    await api.getProducts()
    await api.getProducts()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps working when localStorage cannot be accessed', async () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('access denied')
      },
    })
    const api = await loadApi()

    await expect(api.getProducts()).resolves.toHaveLength(list.length)
  })
})
