import { describe, expect, it } from 'vitest'
import type { Product } from '@/api/schemas'
import { filterProducts } from '../filterProducts'

function product(id: string, brand: string | null, model: string | null): Product {
  return { id, brand, model, price: 100, imgUrl: null }
}

const acerIconia = product('1', 'Acer', 'Iconia Talk S')
const acerLiquid = product('2', 'Acer', 'Liquid Jade')
const samsungGalaxy = product('3', 'Samsung', 'Galaxy S7')
const catalog = [acerIconia, acerLiquid, samsungGalaxy]

const ids = (products: Product[]) => products.map((item) => item.id)

describe('filterProducts', () => {
  it.each(['', '   '])('returns every product when the query is blank: %j', (query) => {
    expect(filterProducts(catalog, query)).toEqual(catalog)
  })

  it('finds the products of a brand', () => {
    expect(ids(filterProducts(catalog, 'acer'))).toEqual(['1', '2'])
  })

  it('finds the products by model', () => {
    expect(ids(filterProducts(catalog, 'galaxy'))).toEqual(['3'])
  })

  it('finds the products by a part of a word', () => {
    expect(ids(filterProducts(catalog, 'ico'))).toEqual(['1'])
  })

  it('ignores the letter case', () => {
    expect(ids(filterProducts(catalog, 'ICONIA'))).toEqual(['1'])
  })

  it('ignores the accents of the query', () => {
    expect(ids(filterProducts(catalog, 'iconía'))).toEqual(['1'])
  })

  it('ignores the accents of the product', () => {
    const accented = product('4', 'Móvil', 'Único')

    expect(ids(filterProducts([accented], 'movil unico'))).toEqual(['4'])
  })

  it('matches the words in any order', () => {
    expect(ids(filterProducts(catalog, 'galaxy samsung'))).toEqual(['3'])
  })

  it('requires every word to match', () => {
    expect(ids(filterProducts(catalog, 'acer talk'))).toEqual(['1'])
    expect(filterProducts(catalog, 'acer samsung')).toEqual([])
  })

  it('ignores the extra spaces around and between the words', () => {
    expect(ids(filterProducts(catalog, '  acer    liquid  '))).toEqual(['2'])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterProducts(catalog, 'nokia')).toEqual([])
  })

  it('filters by what is available when the brand or the model is missing', () => {
    const withoutBrand = product('4', null, 'Iconia')
    const withoutModel = product('5', 'Acer', null)
    const list = [withoutBrand, withoutModel]

    expect(ids(filterProducts(list, 'iconia'))).toEqual(['4'])
    expect(ids(filterProducts(list, 'acer'))).toEqual(['5'])
  })

  it('only keeps a product with neither brand nor model when the query is blank', () => {
    const nameless = product('4', null, null)

    expect(filterProducts([nameless], 'acer')).toEqual([])
    expect(filterProducts([nameless], '')).toEqual([nameless])
  })

  it('keeps the original order and does not modify the list', () => {
    const original = [samsungGalaxy, acerLiquid, acerIconia]
    const copy = [...original]

    const result = filterProducts(original, 'a')

    expect(ids(result)).toEqual(['3', '2', '1'])
    expect(original).toEqual(copy)
  })
})
