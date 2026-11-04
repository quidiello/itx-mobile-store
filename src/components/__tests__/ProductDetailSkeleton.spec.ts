import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductDetailSkeleton from '../ProductDetailSkeleton.vue'

describe('ProductDetailSkeleton', () => {
  it('draws the image next to the description and the actions', () => {
    const wrapper = mount(ProductDetailSkeleton)

    expect(wrapper.find('.image').exists()).toBe(true)
    expect(wrapper.find('.head .title').exists()).toBe(true)
    expect(wrapper.find('.actions .button').exists()).toBe(true)
  })

  it('draws one row for each of the main specifications', () => {
    const wrapper = mount(ProductDetailSkeleton)

    expect(wrapper.findAll('.row')).toHaveLength(5)
  })

  it('has no text of its own, so it is not read by assistive technology', () => {
    const wrapper = mount(ProductDetailSkeleton)

    expect(wrapper.text()).toBe('')
  })
})
