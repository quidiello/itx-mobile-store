import { afterEach, describe, expect, it, vi } from 'vitest'
import { getStorage } from '../storage'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getStorage', () => {
  it('returns the local storage of the browser', () => {
    const storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    vi.stubGlobal('localStorage', storage)

    expect(getStorage()).toBe(storage)
  })

  it('returns null when the local storage cannot be accessed', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('access denied')
      },
    })

    expect(getStorage()).toBeNull()
  })

  it('returns null when there is no local storage', () => {
    vi.stubGlobal('localStorage', undefined)

    expect(getStorage()).toBeNull()
  })
})
