import { toValue, watch, type MaybeRefOrGetter } from 'vue'
import { api } from '@/api'
import type { ProductDetail } from '@/api/schemas'
import { useAsyncData } from './useAsyncData'

export function useProduct(id: MaybeRefOrGetter<string>) {
  const {
    data: product,
    loading,
    error,
    load,
  } = useAsyncData<ProductDetail | null>(() => api.getProduct(toValue(id)), null)

  watch(() => toValue(id), load, { immediate: true })

  return { product, loading, error, reload: load }
}
