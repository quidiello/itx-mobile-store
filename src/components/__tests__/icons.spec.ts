import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Component } from 'vue'
import ChevronIcon from '../icons/ChevronIcon.vue'
import IconBase from '../icons/IconBase.vue'

const modules = import.meta.glob<{ default: Component }>('../icons/**/*Icon.vue', { eager: true })
const icons = Object.entries(modules)
  .map(([path, module]) => [path.split('/').pop()!.replace('.vue', ''), module.default] as const)
  .filter(([name]) => name !== 'ChevronIcon')

describe('icons', () => {
  it('finds the icons of the project', () => {
    expect(icons.length).toBeGreaterThanOrEqual(17)
  })

  describe.each(icons)('%s', (_name, icon) => {
    it('is drawn on top of the shared base', () => {
      const wrapper = mount(icon)

      expect(wrapper.findComponent(IconBase).exists()).toBe(true)
    })

    it('is a decorative image without any text', () => {
      const wrapper = mount(icon)

      expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
      expect(wrapper.text()).toBe('')
    })

    it('takes the color of the text around it', () => {
      const wrapper = mount(icon)

      expect(wrapper.get('svg').attributes('stroke')).toBe('currentColor')
    })

    it('draws at least one shape', () => {
      const wrapper = mount(icon)

      expect(wrapper.get('svg').element.children.length).toBeGreaterThan(0)
    })
  })
})

describe('IconBase', () => {
  it('is 16 pixels wide by default', () => {
    const wrapper = mount(IconBase)

    expect(wrapper.get('svg').attributes('width')).toBe('16')
    expect(wrapper.get('svg').attributes('height')).toBe('16')
  })

  it('takes the size it is given', () => {
    const wrapper = mount(IconBase, { props: { size: 24 } })

    expect(wrapper.get('svg').attributes('width')).toBe('24')
    expect(wrapper.get('svg').attributes('height')).toBe('24')
  })

  it('lets the class of the parent reach the image', () => {
    const wrapper = mount(IconBase, { attrs: { class: 'mine' } })

    expect(wrapper.get('svg').classes()).toContain('mine')
  })
})

describe('ChevronIcon', () => {
  it('points down by default', () => {
    const wrapper = mount(ChevronIcon)

    expect(wrapper.get('svg').classes()).toContain('down')
  })

  it.each(['up', 'right'] as const)('can point %s', (direction) => {
    const wrapper = mount(ChevronIcon, { props: { direction } })

    expect(wrapper.get('svg').classes()).toContain(direction)
  })
})
