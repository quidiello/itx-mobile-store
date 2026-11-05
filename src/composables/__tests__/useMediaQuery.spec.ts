import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useMediaQuery } from '../useMediaQuery'

function stubMedia(initial: boolean) {
  let listener: () => void = () => {}
  const list = {
    matches: initial,
    addEventListener: vi.fn<(event: string, callback: () => void) => void>((_event, callback) => {
      listener = callback
    }),
    removeEventListener: vi.fn<(event: string, callback: () => void) => void>(),
  }
  const matchMedia = vi.fn<(query: string) => typeof list>(() => list)
  vi.stubGlobal('matchMedia', matchMedia)
  return {
    list,
    matchMedia,
    change(value: boolean) {
      list.matches = value
      listener()
    },
  }
}

function mountWithQuery(query = '(max-width: 40rem)') {
  const Probe = defineComponent({
    setup() {
      const matches = useMediaQuery(query)
      return () => h('p', String(matches.value))
    },
  })
  return mount(Probe)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMediaQuery', () => {
  it('asks the browser about the query it receives', () => {
    const media = stubMedia(false)

    mountWithQuery('(max-width: 40rem)')

    expect(media.matchMedia).toHaveBeenCalledWith('(max-width: 40rem)')
  })

  it('starts with the answer of the browser', async () => {
    stubMedia(true)

    const wrapper = mountWithQuery()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toBe('true')
  })

  it('follows the browser when the answer changes', async () => {
    const media = stubMedia(false)
    const wrapper = mountWithQuery()
    await wrapper.vm.$nextTick()

    media.change(true)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toBe('true')
  })

  it('answers false when the browser cannot answer', async () => {
    vi.stubGlobal('matchMedia', undefined)

    const wrapper = mountWithQuery()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toBe('false')
  })

  it('stops listening once it is removed', () => {
    const media = stubMedia(false)
    const wrapper = mountWithQuery()

    wrapper.unmount()

    expect(media.list.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
