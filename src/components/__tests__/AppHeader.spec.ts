import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { Api } from '@/api/client'
import { routes } from '@/router/routes'
import AppBreadcrumbs from '../AppBreadcrumbs.vue'
import AppHeader from '../AppHeader.vue'
import CartCounter from '../CartCounter.vue'

vi.mock('@/api', () => ({ api: { getProduct: vi.fn<Api['getProduct']>() } }))

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

  it('includes the breadcrumbs', async () => {
    const wrapper = await mountHeader()

    expect(wrapper.findComponent(AppBreadcrumbs).exists()).toBe(true)
  })

  it('includes the cart counter', async () => {
    const wrapper = await mountHeader()

    expect(wrapper.findComponent(CartCounter).exists()).toBe(true)
  })
})
