import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StateMessage from '../StateMessage.vue'

describe('StateMessage', () => {
  it('shows the title and the description', () => {
    const wrapper = mount(StateMessage, {
      props: { icon: 'search', title: 'Nothing found', description: 'Try another search.' },
    })

    expect(wrapper.get('.title').text()).toBe('Nothing found')
    expect(wrapper.get('.description').text()).toBe('Try another search.')
  })

  it('does not draw a description when there is none', () => {
    const wrapper = mount(StateMessage, { props: { icon: 'empty', title: 'No products yet' } })

    expect(wrapper.find('.description').exists()).toBe(false)
  })

  it('shows the action it receives', () => {
    const wrapper = mount(StateMessage, {
      props: { icon: 'error', title: 'Failed' },
      slots: { default: '<button type="button">Try again</button>' },
    })

    expect(wrapper.get('button').text()).toBe('Try again')
  })

  it('does not draw the action area when there is no action', () => {
    const wrapper = mount(StateMessage, { props: { icon: 'empty', title: 'No products yet' } })

    expect(wrapper.find('.action').exists()).toBe(false)
  })

  it('announces an error as an alert', () => {
    const wrapper = mount(StateMessage, { props: { icon: 'error', title: 'Failed' } })

    expect(wrapper.attributes('role')).toBe('alert')
  })

  it.each(['search', 'empty'] as const)('announces a %s state as a status', (icon) => {
    const wrapper = mount(StateMessage, { props: { icon, title: 'Nothing here' } })

    expect(wrapper.attributes('role')).toBe('status')
  })

  it('hides the icon from assistive technology', () => {
    const wrapper = mount(StateMessage, { props: { icon: 'error', title: 'Failed' } })

    expect(wrapper.get('.icon').attributes('aria-hidden')).toBe('true')
  })
})
