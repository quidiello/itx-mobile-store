import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { Api } from '@/api/client'
import { config } from '@/config'
import { useCartStore } from '@/stores/cart'
import CartCounter from '../CartCounter.vue'

vi.mock('@/api', () => ({ api: { addToCart: vi.fn<Api['addToCart']>() } }))

function useStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial))
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value)
    },
    removeItem: (key: string) => {
      items.delete(key)
    },
  })
}

function mountCounter() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(CartCounter, { global: { plugins: [pinia] } })
  return { wrapper, cart: useCartStore() }
}

beforeEach(() => {
  useStorage()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CartCounter', () => {
  it('shows zero when the cart is empty', () => {
    const { wrapper } = mountCounter()

    expect(wrapper.text()).toContain('0')
  })

  it('shows the number of products that were stored in the cart', () => {
    useStorage({ [config.cartStorageKey]: '3' })

    const { wrapper } = mountCounter()

    expect(wrapper.text()).toContain('3')
  })

  it('shows the new number when the cart changes', async () => {
    const { wrapper, cart } = mountCounter()

    cart.count = 5
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('5')
  })

  it.each([
    [0, 'Cart, 0 items'],
    [1, 'Cart, 1 item'],
    [3, 'Cart, 3 items'],
  ])('describes %j products for screen readers as %j', async (count, description) => {
    const { wrapper, cart } = mountCounter()

    cart.count = count
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain(description)
  })

  it('announces the changes politely to screen readers', () => {
    const { wrapper } = mountCounter()

    expect(wrapper.attributes('role')).toBe('status')
  })

  it('is not a link', () => {
    const { wrapper } = mountCounter()

    expect(wrapper.find('a').exists()).toBe(false)
  })
})
