import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { api } from '@/api'
import type { Api } from '@/api/client'
import type { Product } from '@/api/schemas'
import AppSkeleton from '@/components/AppSkeleton.vue'
import ProductCard from '@/components/ProductCard.vue'
import SearchBar from '@/components/SearchBar.vue'
import { routes } from '@/router/routes'
import ProductListView from '../ProductListView.vue'

vi.mock('@/api', () => ({ api: { getProducts: vi.fn<Api['getProducts']>() } }))

const getProducts = vi.mocked(api.getProducts)

function product(id: string, brand: string, model: string): Product {
  return { id, brand, model, price: 100, imgUrl: null }
}

const catalog = [
  product('1', 'Acer', 'Iconia Talk S'),
  product('2', 'Acer', 'Liquid Jade'),
  product('3', 'Samsung', 'Galaxy S7'),
]

async function mountAt(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const wrapper = mount(ProductListView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

const cards = (wrapper: Awaited<ReturnType<typeof mountAt>>['wrapper']) =>
  wrapper.findAllComponents(ProductCard)

beforeEach(() => {
  getProducts.mockReset()
  getProducts.mockResolvedValue(catalog)
})

describe('ProductListView', () => {
  describe('states', () => {
    it('shows skeletons while the products are loading', async () => {
      getProducts.mockReturnValue(new Promise(() => {}))

      const { wrapper } = await mountAt('/')

      expect(wrapper.findAllComponents(AppSkeleton)).toHaveLength(8)
      expect(cards(wrapper)).toHaveLength(0)
    })

    it('keeps the search field available while the products are loading', async () => {
      getProducts.mockReturnValue(new Promise(() => {}))

      const { wrapper } = await mountAt('/')

      expect(wrapper.findComponent(SearchBar).exists()).toBe(true)
    })

    it('shows a card for each product once they are loaded', async () => {
      const { wrapper } = await mountAt('/')

      expect(cards(wrapper)).toHaveLength(3)
      expect(wrapper.findAllComponents(AppSkeleton)).toHaveLength(0)
    })

    it('shows an error with a retry button when the products cannot be loaded', async () => {
      getProducts.mockRejectedValue(new Error('network down'))

      const { wrapper } = await mountAt('/')

      expect(wrapper.text()).toContain('Products could not be loaded')
      expect(wrapper.get('button').text()).toBe('Retry')
      expect(cards(wrapper)).toHaveLength(0)
    })

    it('loads the products again when retrying', async () => {
      getProducts.mockRejectedValueOnce(new Error('network down'))

      const { wrapper } = await mountAt('/')
      await wrapper.get('button').trigger('click')
      await flushPromises()

      expect(getProducts).toHaveBeenCalledTimes(2)
      expect(cards(wrapper)).toHaveLength(3)
      expect(wrapper.text()).not.toContain('Products could not be loaded')
    })

    it('tells that there are no products when the list is empty', async () => {
      getProducts.mockResolvedValue([])

      const { wrapper } = await mountAt('/')

      expect(wrapper.text()).toContain('No products available')
    })
  })

  describe('search', () => {
    it('shows the text of the address in the search field', async () => {
      const { wrapper } = await mountAt('/?q=acer')

      expect(wrapper.get('input').element.value).toBe('acer')
    })

    it('filters the products with the text of the address', async () => {
      const { wrapper } = await mountAt('/?q=acer')

      expect(cards(wrapper)).toHaveLength(2)
    })

    it('tells that nothing matches when the filter leaves no products', async () => {
      const { wrapper } = await mountAt('/?q=nokia')

      expect(wrapper.text()).toContain('No products match "nokia"')
      expect(cards(wrapper)).toHaveLength(0)
    })

    it('filters while the user types and keeps the text in the address', async () => {
      const { wrapper, router } = await mountAt('/')

      await wrapper.get('input').setValue('galaxy')
      await flushPromises()

      expect(cards(wrapper)).toHaveLength(1)
      expect(router.currentRoute.value.query.q).toBe('galaxy')
    })

    it('does not add history entries while the user types', async () => {
      const { wrapper, router } = await mountAt('/')

      await wrapper.get('input').setValue('galaxy')
      await flushPromises()
      router.back()
      await flushPromises()

      expect(router.currentRoute.value.query.q).toBe('galaxy')
    })

    it.each(['', '   '])('removes the text from the address when it is blank: %j', async (text) => {
      const { wrapper, router } = await mountAt('/?q=acer')

      await wrapper.get('input').setValue(text)
      await flushPromises()

      expect(router.currentRoute.value.query).not.toHaveProperty('q')
      expect(cards(wrapper)).toHaveLength(3)
    })
  })
})
