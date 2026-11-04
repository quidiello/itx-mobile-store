import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { api } from '@/api'
import type { Api } from '@/api/client'
import { config } from '@/config'
import { useCartStore } from '../cart'

vi.mock('@/api', () => ({ api: { addToCart: vi.fn<Api['addToCart']>() } }))

const addToCart = vi.mocked(api.addToCart)
const selection = { id: 'p1', colorCode: 1000, storageCode: 2000 }

function createMemoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial))
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value)
    },
    removeItem: (key: string) => {
      items.delete(key)
    },
  }
}

function useStorage(initial: Record<string, string> = {}) {
  const storage = createMemoryStorage(initial)
  vi.stubGlobal('localStorage', storage)
  return storage
}

beforeEach(() => {
  setActivePinia(createPinia())
  addToCart.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('cart store', () => {
  describe('count', () => {
    it('starts at zero when nothing is stored', () => {
      useStorage()

      expect(useCartStore().count).toBe(0)
    })

    it('restores the count that was stored', () => {
      useStorage({ [config.cartStorageKey]: '3' })

      expect(useCartStore().count).toBe(3)
    })

    it.each(['abc', '-1', '1.5', ''])('ignores a stored count that is not valid: %j', (raw) => {
      useStorage({ [config.cartStorageKey]: raw })

      expect(useCartStore().count).toBe(0)
    })
  })

  describe('add', () => {
    it('sends the selection to the api', async () => {
      useStorage()
      addToCart.mockResolvedValue(1)

      await useCartStore().add(selection)

      expect(addToCart).toHaveBeenCalledWith(selection)
    })

    it('updates the count with the one the api returns', async () => {
      useStorage({ [config.cartStorageKey]: '1' })
      addToCart.mockResolvedValue(2)
      const cart = useCartStore()

      await cart.add(selection)

      expect(cart.count).toBe(2)
    })

    it('keeps the count in the storage', async () => {
      const storage = useStorage()
      addToCart.mockResolvedValue(2)

      await useCartStore().add(selection)

      expect(storage.items.get(config.cartStorageKey)).toBe('2')
    })

    it('keeps the previous count and throws when the api fails', async () => {
      const storage = useStorage({ [config.cartStorageKey]: '3' })
      addToCart.mockRejectedValue(new Error('network down'))
      const cart = useCartStore()

      await expect(cart.add(selection)).rejects.toThrow('network down')

      expect(cart.count).toBe(3)
      expect(storage.items.get(config.cartStorageKey)).toBe('3')
    })
  })

  describe('without a usable storage', () => {
    it('keeps counting when the storage cannot be accessed', async () => {
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        get() {
          throw new Error('access denied')
        },
      })
      addToCart.mockResolvedValue(2)
      const cart = useCartStore()

      await cart.add(selection)

      expect(cart.count).toBe(2)
    })

    it('keeps counting when the count cannot be written', async () => {
      vi.stubGlobal('localStorage', {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota exceeded')
        },
        removeItem: () => {},
      })
      addToCart.mockResolvedValue(2)
      const cart = useCartStore()

      await cart.add(selection)

      expect(cart.count).toBe(2)
    })
  })
})
