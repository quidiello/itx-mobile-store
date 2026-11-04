import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { api } from '@/api'
import type { Api } from '@/api/client'
import { productDetailSchema } from '@/api/schemas'
import details from '@/api/__tests__/fixtures/product-details.json'
import AppSkeleton from '@/components/AppSkeleton.vue'
import ProductActions from '@/components/ProductActions.vue'
import ProductDescription from '@/components/ProductDescription.vue'
import ProductImage from '@/components/ProductImage.vue'
import { routes } from '@/router/routes'
import ProductDetailView from '../ProductDetailView.vue'

vi.mock('@/api', () => ({
  api: { getProduct: vi.fn<Api['getProduct']>(), addToCart: vi.fn<Api['addToCart']>() },
}))

const getProduct = vi.mocked(api.getProduct)
const product = productDetailSchema.parse(details.normal)

async function mountAt(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const wrapper = mount(ProductDetailView, {
    global: {
      plugins: [router, createPinia()],
      stubs: { PageToolbar: { template: '<div><slot name="leading" /><slot /></div>' } },
    },
  })
  await flushPromises()
  return { wrapper, router }
}

beforeEach(() => {
  getProduct.mockReset()
  getProduct.mockResolvedValue(product)
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {}, removeItem: () => {} })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ProductDetailView', () => {
  it('requests the product of the address', async () => {
    await mountAt('/products/abc')

    expect(getProduct).toHaveBeenCalledWith('abc')
  })

  describe('while loading', () => {
    it('shows skeletons instead of the product', async () => {
      getProduct.mockReturnValue(new Promise(() => {}))

      const { wrapper } = await mountAt('/products/abc')

      expect(wrapper.findAllComponents(AppSkeleton).length).toBeGreaterThan(0)
      expect(wrapper.findComponent(ProductDescription).exists()).toBe(false)
      expect(wrapper.findComponent(ProductActions).exists()).toBe(false)
    })

    it('keeps the link back to the product list', async () => {
      getProduct.mockReturnValue(new Promise(() => {}))

      const { wrapper } = await mountAt('/products/abc')

      expect(wrapper.get('a').attributes('aria-label')).toBe('Back to the product list')
    })
  })

  describe('once loaded', () => {
    it('shows the image, the description and the actions of the product', async () => {
      const { wrapper } = await mountAt('/products/abc')

      expect(wrapper.findComponent(ProductImage).exists()).toBe(true)
      expect(wrapper.findComponent(ProductDescription).exists()).toBe(true)
      expect(wrapper.findComponent(ProductActions).exists()).toBe(true)
      expect(wrapper.findAllComponents(AppSkeleton)).toHaveLength(0)
    })

    it('titles the page with the name of the product', async () => {
      const { wrapper } = await mountAt('/products/abc')

      expect(wrapper.get('h1').text()).toBe('Acer Iconia Talk S')
      expect(wrapper.get('img').attributes('alt')).toBe('Acer Iconia Talk S')
    })

    it('uses a generic title when the product has neither brand nor model', async () => {
      getProduct.mockResolvedValue({ ...product, brand: null, model: null })

      const { wrapper } = await mountAt('/products/abc')

      expect(wrapper.get('h1').text()).toBe('Product')
    })

    it('links back to the product list', async () => {
      const { wrapper } = await mountAt('/products/abc')

      const link = wrapper.get('a')
      expect(link.attributes('aria-label')).toBe('Back to the product list')
      expect(link.attributes('href')).toBe('/')
    })
  })

  describe('when the product cannot be loaded', () => {
    it('shows an error with a retry button', async () => {
      getProduct.mockRejectedValue(new Error('network down'))

      const { wrapper } = await mountAt('/products/abc')

      expect(wrapper.text()).toContain('Product could not be loaded')
      expect(wrapper.get('button').text()).toBe('Retry')
      expect(wrapper.findComponent(ProductDescription).exists()).toBe(false)
    })

    it('loads the product again when retrying', async () => {
      getProduct.mockRejectedValueOnce(new Error('network down'))

      const { wrapper } = await mountAt('/products/abc')
      await wrapper.get('button').trigger('click')
      await flushPromises()

      expect(getProduct).toHaveBeenCalledTimes(2)
      expect(wrapper.findComponent(ProductDescription).exists()).toBe(true)
      expect(wrapper.text()).not.toContain('Product could not be loaded')
    })
  })

  it('loads another product when the address changes', async () => {
    const { router } = await mountAt('/products/abc')

    await router.push('/products/other')
    await flushPromises()

    expect(getProduct).toHaveBeenLastCalledWith('other')
  })
})
