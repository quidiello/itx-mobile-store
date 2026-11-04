import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from '@/router/routes'
import AppBreadcrumbs from '../AppBreadcrumbs.vue'
import PageToolbar from '../PageToolbar.vue'

async function mountToolbar() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/')
  const wrapper = mount(PageToolbar, {
    slots: { default: '<button type="button">Page action</button>' },
    global: { plugins: [router] },
  })
  await flushPromises()
  return wrapper
}

describe('PageToolbar', () => {
  it('includes the breadcrumbs', async () => {
    const wrapper = await mountToolbar()

    expect(wrapper.findComponent(AppBreadcrumbs).exists()).toBe(true)
  })

  it('shows the content of the page next to the breadcrumbs', async () => {
    const wrapper = await mountToolbar()

    expect(wrapper.get('button').text()).toBe('Page action')
  })
})
