interface Entry<T> {
  value: T
  expiresAt: number
}

export interface CacheOptions {
  ttlMs: number
  prefix: string
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null
}

export function createCache({ ttlMs, prefix, storage = null }: CacheOptions) {
  const memory = new Map<string, Entry<unknown>>()
  const inFlight = new Map<string, Promise<unknown>>()

  const isFresh = (entry: Entry<unknown>) => entry.expiresAt > Date.now()

  function readStorage(key: string): Entry<unknown> | undefined {
    try {
      const raw = storage?.getItem(prefix + key)
      if (!raw) return undefined
      const entry = JSON.parse(raw) as Entry<unknown>
      return typeof entry?.expiresAt === 'number' ? entry : undefined
    } catch {
      return undefined
    }
  }

  function remove(key: string) {
    memory.delete(key)
    try {
      storage?.removeItem(prefix + key)
    } catch {
      // storage unavailable: keep going in memory
    }
  }

  function get<T>(key: string): T | undefined {
    const entry = memory.get(key) ?? readStorage(key)
    if (!entry) return undefined
    if (!isFresh(entry)) {
      remove(key)
      return undefined
    }
    memory.set(key, entry)
    return entry.value as T
  }

  function set<T>(key: string, value: T) {
    const entry: Entry<T> = { value, expiresAt: Date.now() + ttlMs }
    memory.set(key, entry)
    try {
      storage?.setItem(prefix + key, JSON.stringify(entry))
    } catch {
      // storage unavailable or full: keep going in memory
    }
  }

  function remember<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = get<T>(key)
    if (cached !== undefined) return Promise.resolve(cached)

    const pending = inFlight.get(key) as Promise<T> | undefined
    if (pending) return pending

    const request = loader()
      .then((value) => {
        set(key, value)
        return value
      })
      .finally(() => inFlight.delete(key))

    inFlight.set(key, request)
    return request
  }

  return { get, set, remove, remember }
}

export type Cache = ReturnType<typeof createCache>
