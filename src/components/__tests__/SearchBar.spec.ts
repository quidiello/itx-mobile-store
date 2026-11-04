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
})
