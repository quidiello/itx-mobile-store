import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useImageFallback } from '../useImageFallback'

describe('useImageFallback', () => {
  it('gives the address of the image while it works', () => {
    const { url } = useImageFallback(() => 'https://img.test/p1.jpg')

    expect(url.value).toBe('https://img.test/p1.jpg')
  })

  it('gives nothing when there is no address', () => {
    const { url } = useImageFallback(() => null)

    expect(url.value).toBeNull()
  })

  it('gives nothing once the image has failed', () => {
    const { url, onError } = useImageFallback(() => 'https://img.test/p1.jpg')

    onError()

    expect(url.value).toBeNull()
  })

  it('tries the image again when its address changes after a failure', async () => {
    const source = ref<string | null>('https://img.test/p1.jpg')
    const { url, onError } = useImageFallback(() => source.value)
    onError()

    source.value = 'https://img.test/p2.jpg'
    await nextTick()

    expect(url.value).toBe('https://img.test/p2.jpg')
  })
})
