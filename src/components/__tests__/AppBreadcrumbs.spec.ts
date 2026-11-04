import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { api } from '@/api'
import type { Api } from '@/api/client'
import { productDetailSchema } from '@/api/schemas'
import details from '@/api/__tests__/fixtures/product-details.json'
import { routes } from '@/router/routes'
import AppBreadcrumbs from '../AppBreadcrumbs.vue'
import AppSkeleton from '../AppSkeleton.vue'

vi.mock('@/api', () => ({ api: { getProduct: vi.fn<Api['getProduct']>() } }))

const getProduct = vi.mocked(api.getProduct)
const product = productDetailSchema.parse(details.normal)

async function mountAt(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const wrapper = mount(AppBreadcrumbs, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  getProduct.mockReset()
  getProduct.mockResolvedValue(product)
})

describe('AppBreadcrumbs', () => {
  it('is a navigation landmark labelled as breadcrumb', async () => {
    const wrapper = await mountAt('/')

    expect(wrapper.get('nav').attributes('aria-label')).toBe('Breadcrumb')
  })

  describe('on the product list', () => {
    it('shows the home as the current page, without a link', async () => {
      const wrapper = await mountAt('/')

      expect(wrapper.text()).toBe('Home')
      expect(wrapper.findAll('a')).toHaveLength(0)
      expect(wrapper.get('li').attributes('aria-current')).toBe('page')
    })

    it('does not request any product', async () => {
      await mountAt('/')

      expect(getProduct).not.toHaveBeenCalled()
    })
  })

  describe('on the product detail', () => {
    it('links the home to the product list and shows the product as the current page', async () => {
      const wrapper = await mountAt(`/products/${product.id}`)

      const items = wrapper.findAll('li')
      expect(items).toHaveLength(2)
      expect(items[0]!.get('a').attributes('href')).toBe('/')
      expect(items[0]!.text()).toBe('Home')
      expect(items[1]!.text()).toBe('Acer Iconia Talk S')
      expect(items[1]!.attributes('aria-current')).toBe('page')
      expect(wrapper.findAll('a')).toHaveLength(1)
    })

    it('requests the product of the address', async () => {
      await mountAt('/products/abc')

      expect(getProduct).toHaveBeenCalledWith('abc')
    })

    it('shows a skeleton while the product is loading', async () => {
      getProduct.mockReturnValue(new Promise(() => {}))

      const wrapper = await mountAt(`/products/${product.id}`)

      expect(wrapper.findComponent(AppSkeleton).exists()).toBe(true)
      expect(wrapper.get('a').text()).toBe('Home')
    })
  })

  describe('on the not found page', () => {
    it('links the home to the product list', async () => {
      const wrapper = await mountAt('/loquesea')

      expect(wrapper.get('a').attributes('href')).toBe('/')
      expect(wrapper.text()).toBe('Home')
      expect(wrapper.find('[aria-current]').exists()).toBe(false)
    })
  })
})
