import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CommandIcon from '../icons/ui/CommandIcon.vue'
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
    function press(init: KeyboardEventInit, target: EventTarget = document.body) {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        bubbles: true,
        cancelable: true,
        ...init,
      })
      target.dispatchEvent(event)
      return event
    }

    function mountAttached() {
      return mount(SearchBar, { props: { modelValue: '' }, attachTo: document.body })
    }

    it.each([
      ['Ctrl+K', { ctrlKey: true }],
      ['Cmd+K', { metaKey: true }],
    ])('focuses the field with %s anywhere on the page', (_name, init) => {
      const wrapper = mountAttached()

      const event = press(init)

      expect(wrapper.get('input').element).toBe(document.activeElement)
      expect(event.defaultPrevented).toBe(true)
      wrapper.unmount()
    })

    it('focuses the field even when the user is in another field', () => {
      const wrapper = mountAttached()
      const other = document.createElement('input')
      document.body.appendChild(other)
      other.focus()

      press({ ctrlKey: true }, other)

      expect(wrapper.get('input').element).toBe(document.activeElement)
      other.remove()
      wrapper.unmount()
    })

    it('does nothing when the letter is pressed without a modifier', () => {
      const wrapper = mountAttached()

      const event = press({})

      expect(wrapper.get('input').element).not.toBe(document.activeElement)
      expect(event.defaultPrevented).toBe(false)
      wrapper.unmount()
    })

    it('does nothing when the slash is pressed', () => {
      const wrapper = mountAttached()

      press({ key: '/' })

      expect(wrapper.get('input').element).not.toBe(document.activeElement)
      wrapper.unmount()
    })

    it.each([
      ['Shift', { ctrlKey: true, shiftKey: true }],
      ['Alt', { ctrlKey: true, altKey: true }],
    ])('ignores the shortcut when %s is also pressed', (_name, init) => {
      const wrapper = mountAttached()

      press(init)

      expect(wrapper.get('input').element).not.toBe(document.activeElement)
      wrapper.unmount()
    })

    it('stops listening once the search bar is removed', () => {
      const wrapper = mountAttached()
      const input = wrapper.get('input').element
      wrapper.unmount()

      press({ ctrlKey: true })

      expect(input).not.toBe(document.activeElement)
    })

    it('announces the shortcut to assistive technology', () => {
      const wrapper = mount(SearchBar, { props: { modelValue: '' } })

      expect(wrapper.get('input').attributes('aria-keyshortcuts')).toBe('Control+K Meta+K')
    })

    it('shows the hint only while the field is empty', async () => {
      const wrapper = mount(SearchBar, { props: { modelValue: '' } })
      expect(wrapper.find('.shortcut').exists()).toBe(true)

      await wrapper.setProps({ modelValue: 'acer' })

      expect(wrapper.find('.shortcut').exists()).toBe(false)
    })

    it('shows the command icon and the letter as two keys on macOS', () => {
      const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'platform')!
      Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true })

      const wrapper = mount(SearchBar, { props: { modelValue: '' } })

      const keys = wrapper.findAll('kbd')
      expect(keys).toHaveLength(2)
      expect(keys[0]!.findComponent(CommandIcon).exists()).toBe(true)
      expect(keys[1]!.text()).toBe('K')
      delete (navigator as { platform?: string }).platform
      Object.defineProperty(Navigator.prototype, 'platform', original)
    })

    it('shows Ctrl and K as two keys on systems other than macOS', () => {
      const wrapper = mount(SearchBar, { props: { modelValue: '' } })

      expect(wrapper.findAll('kbd').map((key) => key.text())).toEqual(['Ctrl', 'K'])
    })
  })

  it('lets its parent put the focus on the field', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' }, attachTo: document.body })

    wrapper.vm.focus()

    expect(wrapper.get('input').element).toBe(document.activeElement)
    wrapper.unmount()
  })
})
