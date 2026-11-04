import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api'
import type { AddToCartPayload } from '@/api/client'
import { config } from '@/config'
import { getStorage } from '@/services/storage'

function readCount(storage: Storage | null) {
  try {
    const raw = storage?.getItem(config.cartStorageKey)
    const count = Number(raw)
    return raw && Number.isInteger(count) && count >= 0 ? count : 0
  } catch {
    return 0
  }
}

export const useCartStore = defineStore('cart', () => {
  const storage = getStorage()
  const count = ref(readCount(storage))

  async function add(payload: AddToCartPayload) {
    count.value = await api.addToCart(payload)
    try {
      storage?.setItem(config.cartStorageKey, String(count.value))
    } catch {
      // storage unavailable or full: the count stays in memory
    }
  }

  return { count, add }
})
