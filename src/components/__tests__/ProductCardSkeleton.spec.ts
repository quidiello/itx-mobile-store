import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCardSkeleton from '../ProductCardSkeleton.vue'

describe('ProductCardSkeleton', () => {
  it('draws the places of the image, the brand, the model and the price', () => {
    const wrapper = mount(ProductCardSkeleton)

    expect(wrapper.find('.image .skeleton-block').exists()).toBe(true)
    expect(wrapper.find('.brand').exists()).toBe(true)
    expect(wrapper.find('.model').exists()).toBe(true)
    expect(wrapper.find('.price').exists()).toBe(true)
  })

  it('has no text of its own, so it is not read by assistive technology', () => {
    const wrapper = mount(ProductCardSkeleton)

    expect(wrapper.text()).toBe('')
  })

  it('gives the model a different width depending on its position', () => {
    const first = mount(ProductCardSkeleton, { props: { index: 0 } })
    const second = mount(ProductCardSkeleton, { props: { index: 1 } })

    expect(first.get('.model').attributes('style')).not.toBe(
      second.get('.model').attributes('style'),
    )
  })
})
