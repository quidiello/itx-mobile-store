import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductImagePlaceholder from '../ProductImagePlaceholder.vue'

describe('ProductImagePlaceholder', () => {
  it('draws an icon without any text', () => {
    const wrapper = mount(ProductImagePlaceholder)

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toBe('')
  })

  it('is hidden from screen readers', () => {
    const wrapper = mount(ProductImagePlaceholder)

    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })
})
