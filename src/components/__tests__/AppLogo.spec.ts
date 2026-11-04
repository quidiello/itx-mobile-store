import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLogo from '../AppLogo.vue'

describe('AppLogo', () => {
  it('draws the mark as an image hidden from assistive technology', () => {
    const wrapper = mount(AppLogo)

    const svg = wrapper.get('svg')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toBe('')
  })
})
