import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { api } from '@/api'
import type { ProductDetail } from '@/api/schemas'

export function useProduct(id: MaybeRefOrGetter<string>) {
  const product = ref<ProductDetail | null>(null)
  const loading = ref(true)
  const error = ref<Error | null>(null)
  let latestRequest = 0

  async function load() {
    const request = ++latestRequest
    product.value = null
    error.value = null
    loading.value = true

    try {
      const loaded = await api.getProduct(toValue(id))
      if (request === latestRequest) product.value = loaded
    } catch (reason) {
      if (request === latestRequest) {
        error.value = reason instanceof Error ? reason : new Error(String(reason))
      }
    } finally {
      if (request === latestRequest) loading.value = false
    }
  }

  watch(() => toValue(id), load, { immediate: true })

  return { product, loading, error, reload: load }
}
