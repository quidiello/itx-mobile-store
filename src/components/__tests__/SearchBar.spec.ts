import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '../SearchBar.vue'

describe('SearchBar', () => {
  it('shows the value it receives', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: 'acer' } })

    expect(wrapper.get('input').element.value).toBe('acer')
  })

  it('shows the new value when the one it receives changes', async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: 'acer' } })

    await wrapper.setProps({ modelValue: 'samsung' })

    expect(wrapper.get('input').element.value).toBe('samsung')
  })

  it('emits the text on every keystroke', async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })
    const input = wrapper.get('input')

    await input.setValue('a')
    await input.setValue('ac')

    expect(wrapper.emitted('update:modelValue')).toEqual([['a'], ['ac']])
  })

  it('is a search field with a hint of what can be searched', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })

    const input = wrapper.get('input')
    expect(input.attributes('type')).toBe('search')
    expect(input.attributes('placeholder')).toBe('Search by brand or model')
  })

  it('has an accessible label linked to the field', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })

    const label = wrapper.get('label')
    expect(label.text()).toBe('Search by brand or model')
    expect(label.attributes('for')).toBe(wrapper.get('input').attributes('id'))
  })

  it('shows no clear button while the field is empty', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('clears the search and focuses the field when the clear button is pressed', async () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: 'acer' },
      attachTo: document.body,
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    expect(wrapper.get('input').element).toBe(document.activeElement)
    wrapper.unmount()
  })

  it('names the clear button for assistive technology', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: 'acer' } })

    expect(wrapper.get('button').attributes('aria-label')).toBe('Clear search')
  })

  describe('shortcut', () => {
    function press(key: string, init: KeyboardEventInit = {}, target: EventTarget = document.body) {
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
      )
    }

    it('focuses the field when slash is pressed anywhere on the page', () => {
      const wrapper = mount(SearchBar, { props: { modelValue: '' }, attachTo: document.body })

      press('/')

      expect(wrapper.get('input').element).toBe(document.activeElement)
      wrapper.unmount()
    })

    it('does not steal the slash while the user is typing in another field', () => {
      const wrapper = mount(SearchBar, { props: { modelValue: '' }, attachTo: document.body })
      const other = document.createElement('input')
      document.body.appendChild(other)
      other.focus()

      press('/', {}, other)

      expect(other).toBe(document.activeElement)
      other.remove()
      wrapper.unmount()
    })

    it('ignores the slash combined with a modifier key', () => {
      const wrapper = mount(SearchBar, { props: { modelValue: '' }, attachTo: document.body })

      press('/', { ctrlKey: true })

      expect(wrapper.get('input').element).not.toBe(document.activeElement)
      wrapper.unmount()
    })

    it('stops listening once the search bar is removed', () => {
      const wrapper = mount(SearchBar, { props: { modelValue: '' }, attachTo: document.body })
      const input = wrapper.get('input').element
      wrapper.unmount()

      press('/')

      expect(input).not.toBe(document.activeElement)
    })

    it('shows the hint only while the field is empty', async () => {
      const wrapper = mount(SearchBar, { props: { modelValue: '' } })
      expect(wrapper.find('kbd').exists()).toBe(true)

      await wrapper.setProps({ modelValue: 'acer' })

      expect(wrapper.find('kbd').exists()).toBe(false)
    })
  })
})
