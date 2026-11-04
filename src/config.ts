const APP_NAME = 'itx-store'
const CACHE_VERSION = 'v1'
const CACHE_TTL_MS = 60 * 60 * 1000
const CART_STORAGE_KEY = `${APP_NAME}:cart-count`
const LOCALE = 'en'
const CURRENCY = 'EUR'

interface Env {
  VITE_API_BASE_URL?: string
}

function isValidUrl(value: string) {
  try {
    return Boolean(new URL(value))
  } catch {
    return false
  }
}

function parseBaseUrl(value: string | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) throw new Error('Missing environment variable VITE_API_BASE_URL')
  if (!isValidUrl(trimmed)) throw new Error(`VITE_API_BASE_URL is not a valid URL: ${trimmed}`)
  return trimmed.replace(/\/+$/, '')
}

export function createConfig(env: Env) {
  return {
    apiBaseUrl: parseBaseUrl(env.VITE_API_BASE_URL),
    cacheTtlMs: CACHE_TTL_MS,
    cachePrefix: `${APP_NAME}:${CACHE_VERSION}:`,
    cartStorageKey: CART_STORAGE_KEY,
    locale: LOCALE,
    currency: CURRENCY,
  }
}

export const config = createConfig(import.meta.env)
