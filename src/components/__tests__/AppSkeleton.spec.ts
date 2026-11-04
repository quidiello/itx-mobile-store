import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSkeleton from '../AppSkeleton.vue'

describe('AppSkeleton', () => {
  it('announces that the content is loading to screen readers', () => {
    const wrapper = mount(AppSkeleton)

    expect(wrapper.text()).toBe('Loading')
  })

  it('applies the width and the height it receives', () => {
    const wrapper = mount(AppSkeleton, { props: { width: '120px', height: '2rem' } })

    const style = (wrapper.element as HTMLElement).style
    expect(style.width).toBe('120px')
    expect(style.height).toBe('2rem')
  })

  it('does not set an inline size when it receives none', () => {
    const wrapper = mount(AppSkeleton)

    const style = (wrapper.element as HTMLElement).style
    expect(style.width).toBe('')
    expect(style.height).toBe('')
  })
})
