import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useAsyncData } from '../useAsyncData'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useAsyncData', () => {
  it('starts loading, with the empty value and without error', () => {
    const { data, loading, error } = useAsyncData(() => new Promise<string>(() => {}), 'empty')

    expect(data.value).toBe('empty')
    expect(loading.value).toBe(true)
    expect(error.value).toBeNull()
  })

  it('keeps the data it loads and stops loading', async () => {
    const { data, loading, load } = useAsyncData(() => Promise.resolve('loaded'), 'empty')

    await load()

    expect(data.value).toBe('loaded')
    expect(loading.value).toBe(false)
  })

  it('keeps the error when the loading fails', async () => {
    const failure = new Error('network down')
    const { data, loading, error, load } = useAsyncData(() => Promise.reject(failure), 'empty')

    await load()

    expect(error.value).toBe(failure)
    expect(data.value).toBe('empty')
    expect(loading.value).toBe(false)
  })

  it('wraps a reason that is not an error in an error', async () => {
    const { error, load } = useAsyncData(() => Promise.reject('boom'), 'empty')

    await load()

    expect(error.value).toBeInstanceOf(Error)
    expect(error.value?.message).toBe('boom')
  })

  it('loads again from scratch when it is asked to', async () => {
    const fetcher = vi.fn<() => Promise<string>>().mockRejectedValueOnce(new Error('first'))
    fetcher.mockResolvedValue('second')
    const { data, error, load } = useAsyncData(fetcher, 'empty')
    await load()
    expect(error.value).not.toBeNull()

    await load()

    expect(error.value).toBeNull()
    expect(data.value).toBe('second')
  })

  it('goes back to the empty value while it loads again', async () => {
    const { data, loading, load } = useAsyncData(() => Promise.resolve('loaded'), 'empty')
    await load()

    const again = load()

    expect(data.value).toBe('empty')
    expect(loading.value).toBe(true)
    await again
  })

  it('ignores the answer of an older request when a newer one has been made', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const answers = [first, second]
    const { data, loading, load } = useAsyncData(() => answers.shift()!.promise, 'empty')

    const older = load()
    const newer = load()
    second.resolve('newer')
    await newer
    first.resolve('older')
    await older
    await flushPromises()

    expect(data.value).toBe('newer')
    expect(loading.value).toBe(false)
  })

  it('ignores the failure of an older request when a newer one has been made', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const answers = [first, second]
    const { error, load } = useAsyncData(() => answers.shift()!.promise, 'empty')

    const older = load()
    const newer = load()
    second.resolve('newer')
    await newer
    first.reject(new Error('stale'))
    await older

    expect(error.value).toBeNull()
  })
})
