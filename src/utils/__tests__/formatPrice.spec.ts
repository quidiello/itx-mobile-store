import { describe, expect, it } from 'vitest'
import { formatPrice } from '../formatPrice'

describe('formatPrice', () => {
  it('shows a whole price in euros without decimals', () => {
    expect(formatPrice(170)).toBe('€170')
  })

  it('keeps the cents of a price that has them', () => {
    expect(formatPrice(99.5)).toBe('€99.50')
  })

  it('groups the thousands', () => {
    expect(formatPrice(1234)).toBe('€1,234')
  })

  it('shows a price of zero', () => {
    expect(formatPrice(0)).toBe('€0')
  })

  it('tells that the price is not available when there is none', () => {
    expect(formatPrice(null)).toBe('Not available')
  })
})
