import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { pageTitle, usePageTitle } from '../usePageTitle'

beforeEach(() => {
  document.title = 'Mobile Store'
  pageTitle.value = 'Mobile Store'
})

describe('usePageTitle', () => {
  it('puts the title of the page before the name of the store', () => {
    usePageTitle('Products')

    expect(document.title).toBe('Products · Mobile Store')
    expect(pageTitle.value).toBe('Products · Mobile Store')
  })

  it('follows the title when it changes', async () => {
    const title = ref<string | undefined>('Product')
    usePageTitle(title)

    title.value = 'Acer Liquid E700'
    await nextTick()

    expect(document.title).toBe('Acer Liquid E700 · Mobile Store')
  })

  it('keeps the previous title while there is no title yet', () => {
    document.title = 'Products · Mobile Store'

    usePageTitle(undefined)

    expect(document.title).toBe('Products · Mobile Store')
  })

  it('accepts a function that computes the title', () => {
    usePageTitle(() => 'Page not found')

    expect(document.title).toBe('Page not found · Mobile Store')
  })
})
