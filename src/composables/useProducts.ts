import { ref } from 'vue'
import { api } from '@/api'
import type { Product } from '@/api/schemas'

export function useProducts() {
  const products = ref<Product[]>([])
  const loading = ref(true)
  const error = ref<Error | null>(null)
  let latestRequest = 0

  async function load() {
    const request = ++latestRequest
    products.value = []
    error.value = null
    loading.value = true

    try {
      const loaded = await api.getProducts()
      if (request === latestRequest) products.value = loaded
    } catch (reason) {
      if (request === latestRequest) {
        error.value = reason instanceof Error ? reason : new Error(String(reason))
      }
    } finally {
      if (request === latestRequest) loading.value = false
    }
  }

  load()

  return { products, loading, error, reload: load }
}
