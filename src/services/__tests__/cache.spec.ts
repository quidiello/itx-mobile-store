import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCache } from '../cache'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

function createMemoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial))
  return {
    items,
    getItem: vi.fn<(key: string) => string | null>((key) => items.get(key) ?? null),
    setItem: vi.fn<(key: string, value: string) => void>((key, value) => {
      items.set(key, value)
    }),
    removeItem: vi.fn<(key: string) => void>((key) => {
      items.delete(key)
    }),
  }
}

function createBrokenStorage() {
  const fail = () => {
    throw new Error('storage unavailable')
  }
  return { getItem: fail, setItem: fail, removeItem: fail }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(0)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('get and set', () => {
  it('returns undefined for a key that was never stored', () => {
    expect(createCache().get('products')).toBeUndefined()
  })

  it('returns the stored value while the ttl has not elapsed', () => {
    const cache = createCache({ ttlMs: HOUR })

    cache.set('products', ['a'])
    vi.advanceTimersByTime(HOUR - 1)

    expect(cache.get('products')).toEqual(['a'])
  })

  it('drops the entry as soon as the ttl has elapsed', () => {
    const cache = createCache({ ttlMs: HOUR })

    cache.set('products', ['a'])
    vi.advanceTimersByTime(HOUR)

    expect(cache.get('products')).toBeUndefined()
  })

  it('uses a ttl of one hour by default', () => {
    const cache = createCache()

    cache.set('products', ['a'])
    vi.advanceTimersByTime(HOUR - 1)
    expect(cache.get('products')).toEqual(['a'])

    vi.advanceTimersByTime(1)
    expect(cache.get('products')).toBeUndefined()
  })

  it('expires each entry independently', () => {
    const cache = createCache({ ttlMs: HOUR })

    cache.set('first', 1)
    vi.advanceTimersByTime(30 * MINUTE)
    cache.set('second', 2)
    vi.advanceTimersByTime(31 * MINUTE)

    expect(cache.get('first')).toBeUndefined()
    expect(cache.get('second')).toBe(2)
  })

  it('restarts the expiry when a key is stored again', () => {
    const cache = createCache({ ttlMs: HOUR })

    cache.set('products', ['old'])
    vi.advanceTimersByTime(40 * MINUTE)
    cache.set('products', ['new'])
    vi.advanceTimersByTime(40 * MINUTE)

    expect(cache.get('products')).toEqual(['new'])
  })

  it('removes an entry on demand', () => {
    const cache = createCache()

    cache.set('products', ['a'])
    cache.remove('products')

    expect(cache.get('products')).toBeUndefined()
  })
})

describe('persistence', () => {
  it('lets a new cache read what a previous one stored in the same storage', () => {
    const storage = createMemoryStorage()

    createCache({ storage }).set('products', ['a'])

    expect(createCache({ storage }).get('products')).toEqual(['a'])
  })

  it('stores entries under the configured prefix', () => {
    const storage = createMemoryStorage()

    createCache({ storage, prefix: 'shop:v2:' }).set('products', ['a'])

    expect(storage.items.has('shop:v2:products')).toBe(true)
  })

  it('does not read entries stored under a different prefix', () => {
    const storage = createMemoryStorage()

    createCache({ storage, prefix: 'shop:v1:' }).set('products', ['a'])

    expect(createCache({ storage, prefix: 'shop:v2:' }).get('products')).toBeUndefined()
  })

  it('removes an expired entry from the storage when it is read', () => {
    const storage = createMemoryStorage()
    createCache({ storage, ttlMs: HOUR }).set('products', ['a'])

    vi.advanceTimersByTime(HOUR)

    expect(createCache({ storage, ttlMs: HOUR }).get('products')).toBeUndefined()
    expect(storage.items.size).toBe(0)
  })

  it('removes the entry from the storage on demand', () => {
    const storage = createMemoryStorage()
    const cache = createCache({ storage })

    cache.set('products', ['a'])
    cache.remove('products')

    expect(storage.items.size).toBe(0)
  })
})

describe('storage failures', () => {
  it('keeps serving values from memory when the storage throws', () => {
    const cache = createCache({ storage: createBrokenStorage() })

    cache.set('products', ['a'])

    expect(cache.get('products')).toEqual(['a'])
  })

  it('does not fail when removing an entry from a storage that throws', () => {
    const cache = createCache({ storage: createBrokenStorage() })

    cache.set('products', ['a'])

    expect(() => cache.remove('products')).not.toThrow()
    expect(cache.get('products')).toBeUndefined()
  })

  it('ignores a stored value that is not valid JSON', () => {
    const storage = createMemoryStorage({ 'itx-store:products': '{not json' })

    expect(createCache({ storage }).get('products')).toBeUndefined()
  })

  it.each(['{"value":["a"]}', '{"value":["a"],"expiresAt":"tomorrow"}', 'null', '42'])(
    'ignores a stored value without a numeric expiresAt: %s',
    (raw) => {
      const storage = createMemoryStorage({ 'itx-store:products': raw })

      expect(createCache({ storage }).get('products')).toBeUndefined()
    },
  )
})

describe('remember', () => {
  it('calls the loader once and serves later calls from the cache', async () => {
    const cache = createCache()
    const loader = vi.fn<() => Promise<string[]>>().mockResolvedValue(['a'])

    const first = await cache.remember('products', loader)
    const second = await cache.remember('products', loader)

    expect(first).toEqual(['a'])
    expect(second).toEqual(['a'])
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('stores the loaded value so that get can read it', async () => {
    const cache = createCache()

    await cache.remember('products', () => Promise.resolve(['a']))

    expect(cache.get('products')).toEqual(['a'])
  })

  it('shares a single request between simultaneous calls', async () => {
    const cache = createCache()
    const loader = vi.fn<() => Promise<string[]>>().mockResolvedValue(['a'])

    const results = await Promise.all([
      cache.remember('products', loader),
      cache.remember('products', loader),
    ])

    expect(results).toEqual([['a'], ['a']])
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('does not cache a failed load and retries on the next call', async () => {
    const cache = createCache()
    const loader = vi
      .fn<() => Promise<string[]>>()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(['a'])

    await expect(cache.remember('products', loader)).rejects.toThrow('network down')
    await expect(cache.remember('products', loader)).resolves.toEqual(['a'])

    expect(loader).toHaveBeenCalledTimes(2)
  })

  it('rejects every simultaneous caller when the shared load fails', async () => {
    const cache = createCache()
    const loader = vi.fn<() => Promise<string[]>>().mockRejectedValue(new Error('network down'))

    const results = await Promise.allSettled([
      cache.remember('products', loader),
      cache.remember('products', loader),
    ])

    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected'])
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('loads again once the cached value has expired', async () => {
    const cache = createCache({ ttlMs: HOUR })
    const loader = vi
      .fn<() => Promise<string[]>>()
      .mockResolvedValueOnce(['old'])
      .mockResolvedValueOnce(['new'])

    await cache.remember('products', loader)
    vi.advanceTimersByTime(HOUR)
    const refreshed = await cache.remember('products', loader)

    expect(refreshed).toEqual(['new'])
    expect(loader).toHaveBeenCalledTimes(2)
  })

  it('keeps a separate entry for each key', async () => {
    const cache = createCache()
    const loadFirst = vi.fn<() => Promise<string>>().mockResolvedValue('first')
    const loadSecond = vi.fn<() => Promise<string>>().mockResolvedValue('second')

    expect(await cache.remember('a', loadFirst)).toBe('first')
    expect(await cache.remember('b', loadSecond)).toBe('second')
    expect(loadFirst).toHaveBeenCalledTimes(1)
    expect(loadSecond).toHaveBeenCalledTimes(1)
  })
})
