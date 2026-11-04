import { config } from '@/config'
import { createCache } from '@/services/cache'
import { getStorage } from '@/services/storage'
import { createApi } from './client'

export const api = createApi({
  cache: createCache({
    ttlMs: config.cacheTtlMs,
    prefix: config.cachePrefix,
    storage: getStorage(),
  }),
  baseUrl: config.apiBaseUrl,
})
