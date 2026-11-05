import { api } from '@/api'
import type { Product } from '@/api/schemas'
import { useAsyncData } from './useAsyncData'

export function useProducts() {
  const {
    data: products,
    loading,
    error,
    load,
  } = useAsyncData<Product[]>(() => api.getProducts(), [])

  load()

  return { products, loading, error, reload: load }
}
