import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BackToTop from '../BackToTop.vue'

function scrollTo(position: number) {
  Object.defineProperty(window, 'scrollY', { value: position, configurable: true })
  window.dispatchEvent(new Event('scroll'))
}

let scrollToSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  scrollTo(0)
  scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('BackToTop', () => {
  it('is hidden while the page is at the top', () => {
    const wrapper = mount(BackToTop)

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('appears after scrolling down more than 200 pixels', async () => {
    const wrapper = mount(BackToTop)

    scrollTo(201)
    await wrapper.vm.$nextTick()

    expect(wrapper.get('button').attributes('aria-label')).toBe('Back to top')
  })

  it('stays hidden up to 200 pixels', async () => {
    const wrapper = mount(BackToTop)

    scrollTo(200)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('disappears when the user is back near the top', async () => {
    const wrapper = mount(BackToTop)
    scrollTo(800)
    await wrapper.vm.$nextTick()

    scrollTo(5)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('scrolls smoothly to the top when it is pressed', async () => {
    const wrapper = mount(BackToTop)
    scrollTo(800)
    await wrapper.vm.$nextTick()

    await wrapper.get('button').trigger('click')

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('scrolls without animation when the user prefers reduced motion', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const wrapper = mount(BackToTop)
    scrollTo(800)
    await wrapper.vm.$nextTick()

    await wrapper.get('button').trigger('click')

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('stops listening to the scroll once it is removed', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(BackToTop)

    wrapper.unmount()

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
