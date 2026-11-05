import { describe, expect, it } from 'vitest'
import { productName } from '../productName'

describe('productName', () => {
  it('joins the brand and the model', () => {
    expect(productName({ brand: 'Acer', model: 'Liquid Z6' })).toBe('Acer Liquid Z6')
  })

  it('uses only the model when there is no brand', () => {
    expect(productName({ brand: null, model: 'Liquid Z6' })).toBe('Liquid Z6')
  })

  it('uses only the brand when there is no model', () => {
    expect(productName({ brand: 'Acer', model: null })).toBe('Acer')
  })

  it('falls back to a generic name when there is neither', () => {
    expect(productName({ brand: null, model: null })).toBe('Product')
  })

  it('falls back to a generic name when there is no product yet', () => {
    expect(productName(null)).toBe('Product')
    expect(productName(undefined)).toBe('Product')
  })
})
