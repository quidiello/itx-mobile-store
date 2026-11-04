import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { api } from '@/api'
import type { Api } from '@/api/client'
import { productDetailSchema } from '@/api/schemas'
import details from '@/api/__tests__/fixtures/product-details.json'
import AppSkeleton from '../AppSkeleton.vue'
import ProductBreadcrumb from '../ProductBreadcrumb.vue'

vi.mock('@/api', () => ({ api: { getProduct: vi.fn<Api['getProduct']>() } }))

const getProduct = vi.mocked(api.getProduct)
const product = productDetailSchema.parse(details.normal)

async function mountBreadcrumb() {
  const wrapper = mount(ProductBreadcrumb, { props: { id: product.id } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  getProduct.mockReset()
})

describe('ProductBreadcrumb', () => {
  it('requests the product it receives', async () => {
    getProduct.mockResolvedValue(product)

    await mountBreadcrumb()

    expect(getProduct).toHaveBeenCalledWith(product.id)
  })

  it('shows a skeleton while the product is loading', () => {
    getProduct.mockReturnValue(new Promise(() => {}))

    const wrapper = mount(ProductBreadcrumb, { props: { id: product.id } })

    expect(wrapper.findComponent(AppSkeleton).exists()).toBe(true)
  })

  it('shows the brand and the model once the product is loaded', async () => {
    getProduct.mockResolvedValue(product)

    const wrapper = await mountBreadcrumb()

    expect(wrapper.text()).toBe('Acer Iconia Talk S')
    expect(wrapper.findComponent(AppSkeleton).exists()).toBe(false)
  })

  it('marks itself as the current page', async () => {
    getProduct.mockResolvedValue(product)

    const wrapper = await mountBreadcrumb()

    expect(wrapper.get('li').attributes('aria-current')).toBe('page')
  })

  it.each([
    ['the brand', { brand: null }, 'Iconia Talk S'],
    ['the model', { model: null }, 'Acer'],
  ])('shows only what is left when the product has no %s', async (_, missing, expected) => {
    getProduct.mockResolvedValue({ ...product, ...missing })

    const wrapper = await mountBreadcrumb()

    expect(wrapper.text()).toBe(expected)
  })

  it('falls back to a generic name when the product has neither brand nor model', async () => {
    getProduct.mockResolvedValue({ ...product, brand: null, model: null })

    const wrapper = await mountBreadcrumb()

    expect(wrapper.text()).toBe('Product')
  })

  it('falls back to a generic name when the product cannot be loaded', async () => {
    getProduct.mockRejectedValue(new Error('network down'))

    const wrapper = await mountBreadcrumb()

    expect(wrapper.text()).toBe('Product')
  })
})
