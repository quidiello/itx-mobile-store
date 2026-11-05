import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter, START_LOCATION } from 'vue-router'
import { routes } from '../routes'
import { focusMainAfterNavigation } from '../focusOnNavigation'

async function visit(...paths: string[]) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  const visited = []
  for (const path of paths) {
    await router.push(path)
    visited.push(router.currentRoute.value)
  }
  return visited as [(typeof visited)[number], (typeof visited)[number]]
}

let main: HTMLElement

beforeEach(() => {
  main = document.createElement('main')
  main.tabIndex = -1
  document.body.appendChild(main)
})

afterEach(() => {
  main.remove()
  vi.restoreAllMocks()
})

describe('focusMainAfterNavigation', () => {
  it('moves the focus to the main content when the user goes to another page', async () => {
    const [list, detail] = await visit('/', '/products/abc')

    await focusMainAfterNavigation(detail, list)

    expect(document.activeElement).toBe(main)
  })

  it('does not move the focus when the page is opened for the first time', async () => {
    const [list] = await visit('/', '/')

    await focusMainAfterNavigation(list, START_LOCATION)

    expect(document.activeElement).not.toBe(main)
  })

  it('does not move the focus when only the search changes', async () => {
    const [list, withSearch] = await visit('/', '/?q=acer')

    await focusMainAfterNavigation(withSearch, list)

    expect(document.activeElement).not.toBe(main)
  })

  it('does not scroll the page when it moves the focus', async () => {
    const focus = vi.spyOn(main, 'focus')
    const [list, detail] = await visit('/', '/products/abc')

    await focusMainAfterNavigation(detail, list)

    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('does nothing when the page has no main content', async () => {
    main.remove()
    const [list, detail] = await visit('/', '/products/abc')

    await expect(focusMainAfterNavigation(detail, list)).resolves.toBeUndefined()
  })
})
