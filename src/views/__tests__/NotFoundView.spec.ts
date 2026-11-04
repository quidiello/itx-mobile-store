import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from '@/router/routes'
import NotFoundView from '../NotFoundView.vue'

async function mountView() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/loquesea')
  return mount(NotFoundView, { global: { plugins: [router] } })
}

describe('NotFoundView', () => {
  it('tells the user that the page does not exist', async () => {
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Página no encontrada')
  })

  it('links back to the product list', async () => {
    const wrapper = await mountView()

    const link = wrapper.get('a')
    expect(link.text()).toBe('Volver al listado')
    expect(link.attributes('href')).toBe('/')
  })
})
