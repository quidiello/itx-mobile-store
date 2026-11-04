import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from '../routes'
import { scrollBehavior } from '../scrollBehavior'

async function visit(...paths: string[]) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  const visited = []
  for (const path of paths) {
    await router.push(path)
    visited.push(router.currentRoute.value)
  }
  return visited
}

describe('scrollBehavior', () => {
  it('opens a new page at the top', async () => {
    const [list, detail] = await visit('/', '/products/abc')

    expect(await scrollBehavior(detail!, list!, null)).toEqual({ top: 0 })
  })

  it('restores the position of the page when the user goes back', async () => {
    const [list, detail] = await visit('/', '/products/abc')
    const saved = { left: 0, top: 1200 }

    expect(await scrollBehavior(list!, detail!, saved)).toEqual(saved)
  })

  it('does not move the page when only the search changes', async () => {
    const [list, withSearch] = await visit('/', '/?q=acer')

    expect(await scrollBehavior(withSearch!, list!, null)).toBe(false)
  })
})
