import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsCount from '../ResultsCount.vue'

const visible = (wrapper: ReturnType<typeof mountCount>) => wrapper.get('.count').text()
const announced = (wrapper: ReturnType<typeof mountCount>) => wrapper.get('[role="status"]').text()

function mountCount(shown: number, total: number) {
  return mount(ResultsCount, { props: { shown, total } })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ResultsCount', () => {
  it('tells how many products there are when none is filtered out', () => {
    expect(visible(mountCount(12, 12))).toBe('12 products')
  })

  it('uses the singular when there is a single product', () => {
    expect(visible(mountCount(1, 1))).toBe('1 product')
  })

  it('tells how many of the products match the search', () => {
    expect(visible(mountCount(3, 12))).toBe('3 of 12 products')
  })

  it('does not announce anything when it appears', () => {
    const wrapper = mountCount(12, 12)

    vi.advanceTimersByTime(1000)

    expect(announced(wrapper)).toBe('')
  })

  it('announces the new count once the user stops typing', async () => {
    const wrapper = mountCount(12, 12)

    await wrapper.setProps({ shown: 3 })
    expect(announced(wrapper)).toBe('')
    await vi.advanceTimersByTimeAsync(500)

    expect(announced(wrapper)).toBe('3 of 12 products')
  })

  it('announces only the last count when the user keeps typing', async () => {
    const wrapper = mountCount(12, 12)

    await wrapper.setProps({ shown: 9 })
    await vi.advanceTimersByTimeAsync(200)
    await wrapper.setProps({ shown: 5 })
    await vi.advanceTimersByTimeAsync(200)
    await wrapper.setProps({ shown: 3 })
    await vi.advanceTimersByTimeAsync(500)

    expect(announced(wrapper)).toBe('3 of 12 products')
  })

  it('updates the visible text at once, without waiting', async () => {
    const wrapper = mountCount(12, 12)

    await wrapper.setProps({ shown: 3 })

    expect(visible(wrapper)).toBe('3 of 12 products')
  })

  it('does not announce anything after it is removed', async () => {
    const wrapper = mountCount(12, 12)
    await wrapper.setProps({ shown: 3 })

    wrapper.unmount()

    expect(() => vi.advanceTimersByTime(1000)).not.toThrow()
  })
})
