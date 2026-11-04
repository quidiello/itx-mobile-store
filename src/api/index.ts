import { config } from '@/config'
import { createCache } from '@/services/cache'
import { createApi } from './client'

function getStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const api = createApi({
  cache: createCache({
    ttlMs: config.cacheTtlMs,
    prefix: config.cachePrefix,
    storage: getStorage(),
  }),
  baseUrl: config.apiBaseUrl,
})
