import { ref, type Ref } from 'vue'

export function useAsyncData<T>(fetcher: () => Promise<T>, empty: T) {
  const data = ref(empty) as Ref<T>
  const loading = ref(true)
  const error = ref<Error | null>(null)
  let latestRequest = 0

  async function load() {
    const request = ++latestRequest
    data.value = empty
    error.value = null
    loading.value = true

    try {
      const loaded = await fetcher()
      if (request === latestRequest) data.value = loaded
    } catch (reason) {
      if (request === latestRequest) {
        error.value = reason instanceof Error ? reason : new Error(String(reason))
      }
    } finally {
      if (request === latestRequest) loading.value = false
    }
  }

  return { data, loading, error, load }
}
