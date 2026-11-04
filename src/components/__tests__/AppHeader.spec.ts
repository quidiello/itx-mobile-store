import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from '@/router/routes'
import AppHeader from '../AppHeader.vue'
import CartCounter from '../CartCounter.vue'

async function mountHeader() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/')
  const wrapper = mount(AppHeader, { global: { plugins: [router, createPinia()] } })
  await flushPromises()
  return wrapper
}

describe('AppHeader', () => {
  it('shows the name of the application as a link to the product list', async () => {
    const wrapper = await mountHeader()

    const title = wrapper.get('a')
    expect(title.text()).toBe('Mobile Store')
    expect(title.attributes('href')).toBe('/')
  })

  it('includes the cart counter', async () => {
    const wrapper = await mountHeader()

    expect(wrapper.findComponent(CartCounter).exists()).toBe(true)
  })
})
