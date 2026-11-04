import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { Product } from '@/api/schemas'
import { routes } from '@/router/routes'
import ProductCard from '../ProductCard.vue'
import ProductImagePlaceholder from '../ProductImagePlaceholder.vue'

const product: Product = {
  id: 'p1',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: 170,
  imgUrl: 'https://img.test/p1.jpg',
}

function mountCard(item: Product = product) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  return mount(ProductCard, { props: { product: item }, global: { plugins: [router] } })
}

describe('ProductCard', () => {
  it('shows the brand, the model and the price', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('Acer')
    expect(wrapper.text()).toContain('Iconia Talk S')
    expect(wrapper.text()).toContain('€170')
  })

  it('links to the detail of the product', () => {
    const wrapper = mountCard()

    expect(wrapper.get('a').attributes('href')).toBe('/products/p1')
  })

  it('shows the product image as a decorative lazy image', () => {
    const wrapper = mountCard()

    const image = wrapper.get('img')
    expect(image.attributes('src')).toBe('https://img.test/p1.jpg')
    expect(image.attributes('alt')).toBe('')
    expect(image.attributes('loading')).toBe('lazy')
    expect(wrapper.findComponent(ProductImagePlaceholder).exists()).toBe(false)
  })

  it('shows the placeholder when the product has no image', () => {
    const wrapper = mountCard({ ...product, imgUrl: null })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findComponent(ProductImagePlaceholder).exists()).toBe(true)
  })

  it('shows the placeholder when the image cannot be loaded', async () => {
    const wrapper = mountCard()

    await wrapper.get('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findComponent(ProductImagePlaceholder).exists()).toBe(true)
  })

  it('shows the image again when the product changes after a failed image', async () => {
    const wrapper = mountCard()
    await wrapper.get('img').trigger('error')

    await wrapper.setProps({ product: { ...product, id: 'p2', imgUrl: 'https://img.test/p2.jpg' } })

    expect(wrapper.get('img').attributes('src')).toBe('https://img.test/p2.jpg')
  })

  it.each([
    ['brand', { brand: null }, 'Iconia Talk S'],
    ['model', { model: null }, 'Acer'],
  ])('shows only what is left when the product has no %s', (_, missing, expected) => {
    const wrapper = mountCard({ ...product, ...missing })

    expect(wrapper.text()).toContain(expected)
    expect(wrapper.text()).not.toContain('null')
    expect(wrapper.text()).not.toContain('Unnamed product')
  })

  it('shows a generic name when the product has neither brand nor model', () => {
    const wrapper = mountCard({ ...product, brand: null, model: null })

    expect(wrapper.text()).toContain('Unnamed product')
  })

  it('tells that the price is not available when there is none', () => {
    const wrapper = mountCard({ ...product, price: null })

    expect(wrapper.text()).toContain('Not available')
  })
})
