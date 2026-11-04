import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from '../routes'

async function navigateTo(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  return router.currentRoute.value
}

describe('routes', () => {
  it('shows the product list at the root', async () => {
    const route = await navigateTo('/')

    expect(route.name).toBe('product-list')
  })

  it('shows the product detail and exposes the id', async () => {
    const route = await navigateTo('/products/abc')

    expect(route.name).toBe('product-detail')
    expect(route.params.id).toBe('abc')
  })

  it('decodes the id of the product detail', async () => {
    const route = await navigateTo('/products/a%2Fb')

    expect(route.params.id).toBe('a/b')
  })

  it.each(['/products', '/products/abc/extra', '/loquesea'])(
    'shows the not found page for %s',
    async (path) => {
      const route = await navigateTo(path)

      expect(route.name).toBe('not-found')
    },
  )
})
