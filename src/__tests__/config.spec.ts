import { describe, expect, it } from 'vitest'
import { createConfig } from '../config'

const validEnv = { VITE_API_BASE_URL: 'https://api.test' }

describe('createConfig', () => {
  describe('apiBaseUrl', () => {
    it('keeps a valid URL as it is', () => {
      expect(createConfig(validEnv).apiBaseUrl).toBe('https://api.test')
    })

    it('keeps the path of the URL', () => {
      expect(createConfig({ VITE_API_BASE_URL: 'https://api.test/v1' }).apiBaseUrl).toBe(
        'https://api.test/v1',
      )
    })

    it.each(['https://api.test/', 'https://api.test///'])(
      'removes the trailing slashes from %j',
      (value) => {
        expect(createConfig({ VITE_API_BASE_URL: value }).apiBaseUrl).toBe('https://api.test')
      },
    )

    it('removes the trailing slash that follows a path', () => {
      expect(createConfig({ VITE_API_BASE_URL: 'https://api.test/v1/' }).apiBaseUrl).toBe(
        'https://api.test/v1',
      )
    })

    it('ignores the whitespace around the value', () => {
      expect(createConfig({ VITE_API_BASE_URL: '  https://api.test  ' }).apiBaseUrl).toBe(
        'https://api.test',
      )
    })

    it('throws naming the variable when it is missing', () => {
      expect(() => createConfig({})).toThrow(/VITE_API_BASE_URL/)
    })

    it.each(['', '   '])('throws naming the variable when it is blank: %j', (value) => {
      expect(() => createConfig({ VITE_API_BASE_URL: value })).toThrow(/VITE_API_BASE_URL/)
    })

    it.each(['not a url', 'api.test'])(
      'throws naming the variable when it is not a URL: %j',
      (value) => {
        expect(() => createConfig({ VITE_API_BASE_URL: value })).toThrow(/VITE_API_BASE_URL/)
      },
    )
  })

  describe('cache', () => {
    it('expires the entries after one hour', () => {
      expect(createConfig(validEnv).cacheTtlMs).toBe(60 * 60 * 1000)
    })

    it('prefixes the storage keys with the app name and the cache version', () => {
      expect(createConfig(validEnv).cachePrefix).toMatch(/^itx-store:v\d+:$/)
    })
  })
})
