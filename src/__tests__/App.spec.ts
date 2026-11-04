import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { Api } from '@/api/client'
import { routes } from '@/router/routes'
import AppHeader from '@/components/AppHeader.vue'
import App from '../App.vue'

vi.mock('@/api', () => ({ api: { getProduct: vi.fn<Api['getProduct']>() } }))

async function mountAt(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('App', () => {
  it('shows the header on every page', async () => {
    const list = await mountAt('/')
    const notFound = await mountAt('/loquesea')

    expect(list.findComponent(AppHeader).exists()).toBe(true)
    expect(notFound.findComponent(AppHeader).exists()).toBe(true)
  })

  it('shows the view of the current route', async () => {
    const wrapper = await mountAt('/loquesea')

    expect(wrapper.text()).toContain('Página no encontrada')
  })
})
