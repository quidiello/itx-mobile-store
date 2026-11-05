import { computed, ref, watch } from 'vue'

export function useImageFallback(source: () => string | null) {
  const failed = ref(false)

  watch(source, () => {
    failed.value = false
  })

  const url = computed(() => (failed.value ? null : source()))

  return {
    url,
    onError: () => {
      failed.value = true
    },
  }
}
