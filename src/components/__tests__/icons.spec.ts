import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CloudOffIcon from '../icons/CloudOffIcon.vue'
import PackageIcon from '../icons/PackageIcon.vue'
import SearchIcon from '../icons/SearchIcon.vue'

describe.each([
  ['CloudOffIcon', CloudOffIcon],
  ['SearchIcon', SearchIcon],
  ['PackageIcon', PackageIcon],
])('%s', (_name, icon) => {
  it('draws a decorative image without any text', () => {
    const wrapper = mount(icon)

    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
    expect(wrapper.text()).toBe('')
  })

  it('takes the color of the text around it', () => {
    const wrapper = mount(icon)

    expect(wrapper.get('svg').attributes('stroke')).toBe('currentColor')
  })
})
