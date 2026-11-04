import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductImage from '../ProductImage.vue'
import ProductImagePlaceholder from '../ProductImagePlaceholder.vue'

function mountImage(src: string | null = 'https://img.test/p1.jpg') {
  return mount(ProductImage, { props: { src, alt: 'Acer Iconia Talk S' } })
}

describe('ProductImage', () => {
  it('shows the image with its description', () => {
    const wrapper = mountImage()

    const image = wrapper.get('img')
    expect(image.attributes('src')).toBe('https://img.test/p1.jpg')
    expect(image.attributes('alt')).toBe('Acer Iconia Talk S')
    expect(wrapper.findComponent(ProductImagePlaceholder).exists()).toBe(false)
  })

  it('shows the placeholder when there is no image', () => {
    const wrapper = mountImage(null)

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findComponent(ProductImagePlaceholder).exists()).toBe(true)
  })

  it('shows the placeholder when the image cannot be loaded', async () => {
    const wrapper = mountImage()

    await wrapper.get('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findComponent(ProductImagePlaceholder).exists()).toBe(true)
  })

  it('shows the image again when it changes after a failed one', async () => {
    const wrapper = mountImage()
    await wrapper.get('img').trigger('error')

    await wrapper.setProps({ src: 'https://img.test/p2.jpg' })

    expect(wrapper.get('img').attributes('src')).toBe('https://img.test/p2.jpg')
  })
})
