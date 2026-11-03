import { describe, expect, it } from 'vitest'
import { cartResponseSchema, productDetailSchema, productSchema } from '../schemas'
import details from './fixtures/product-details.json'
import list from './fixtures/product-list.json'

describe('productSchema', () => {
  const base = { id: 'p1', brand: 'Acer', model: 'Iconia', imgUrl: 'img.jpg' }

  describe('price', () => {
    it.each([
      ['170', 170],
      ['353.8', 353.8],
      [170, 170],
      ['', null],
      ['  ', null],
      ['abc', null],
      [null, null],
      [undefined, null],
    ])('maps %j to %j', (input, expected) => {
      expect(productSchema.parse({ ...base, price: input }).price).toBe(expected)
    })
  })

  it('maps every empty field to null when only the id is present', () => {
    expect(productSchema.parse({ id: 'p1' })).toEqual({
      id: 'p1',
      brand: null,
      model: null,
      price: null,
      imgUrl: null,
    })
  })

  it('rejects a product without id', () => {
    expect(productSchema.safeParse({ brand: 'Acer', model: 'Iconia' }).success).toBe(false)
  })

  it('parses the sample list and keeps the products that have no price', () => {
    const products = list.map((item) => productSchema.parse(item))

    expect(products).toHaveLength(list.length)
    expect(products.map((product) => product.price)).toEqual([170, 250, 120, 230, 230, null, null])
  })
})

describe('productDetailSchema', () => {
  it('exposes the numeric and descriptive fields of a regular product', () => {
    const product = productDetailSchema.parse(details.normal)

    expect(product.price).toBe(170)
    expect(product.weight).toBe(260)
    expect(product.cpu).toBe('Quad-core 1.3 GHz Cortex-A53')
    expect(product.dimensions).toBe('191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)')
  })

  it('swaps the screen fields that the API returns crossed', () => {
    const product = productDetailSchema.parse(details.normal)

    expect(product.screenSize).toContain('inches')
    expect(product.screenResolution).toContain('pixels')
  })

  it('renames the misspelled API fields and drops the original names', () => {
    const product = productDetailSchema.parse(details.normal)

    expect(product.dimensions).toBeDefined()
    expect(product.secondaryCamera).toBe('2 MP, 720p')
    expect(product).not.toHaveProperty('dimentions')
    expect(product).not.toHaveProperty('secondaryCmera')
    expect(product).not.toHaveProperty('displayResolution')
    expect(product).not.toHaveProperty('displaySize')
  })

  it('drops the fields that are not part of the model', () => {
    const product = productDetailSchema.parse(details.normal)

    expect(product).not.toHaveProperty('chipset')
    expect(product).not.toHaveProperty('gpu')
  })

  it('maps empty price, weight and dashed dimensions to null', () => {
    const product = productDetailSchema.parse(details.sinPrecio)

    expect(product.price).toBeNull()
    expect(product.weight).toBeNull()
    expect(product.dimensions).toBeNull()
  })

  it('maps dimensions that are just a dash to null', () => {
    expect(productDetailSchema.parse(details.dimensionesGuion).dimensions).toBeNull()
  })

  it('joins the operating system when the API returns it as a list', () => {
    expect(productDetailSchema.parse(details.osEnLista).os).toBe(
      'Android 4.4.4 (KitKat), upgradable to 5.1 (Lollipop)',
    )
  })

  it('joins the cpu when the API returns it as a list', () => {
    expect(productDetailSchema.parse(details.cpuEnLista).cpu).toBe('ST Ericsson PNX6715, 416 MHz')
  })

  it('ignores empty items when joining a list', () => {
    expect(productDetailSchema.parse(details.osEnLista).primaryCamera).toBe(
      '13 MP, f/1.8, autofocus, LED flash',
    )
  })

  describe('options', () => {
    it('keeps colors and storages grouped under options', () => {
      const { options } = productDetailSchema.parse(details.normal)

      expect(options.colors).toHaveLength(1)
      expect(options.storages).toEqual([
        { code: 2000, name: '16 GB' },
        { code: 2001, name: '32 GB' },
      ])
    })

    it('supports a product with many colors', () => {
      const { options } = productDetailSchema.parse(details.muchosColores)

      expect(options.colors).toHaveLength(9)
    })

    it('supports a product with several storages', () => {
      const { options } = productDetailSchema.parse(details.variosAlmacenamientos)

      expect(options.storages.map((storage) => storage.code)).toEqual([2000, 2001, 2002])
    })

    it('defaults to empty lists when options is missing', () => {
      expect(productDetailSchema.parse({ id: 'p1' }).options).toEqual({
        colors: [],
        storages: [],
      })
    })

    it('rejects an option whose code is not an integer', () => {
      const result = productDetailSchema.safeParse({
        id: 'p1',
        options: { colors: [{ code: 1.5, name: 'Black' }] },
      })

      expect(result.success).toBe(false)
    })

    it('rejects an option without name', () => {
      const result = productDetailSchema.safeParse({
        id: 'p1',
        options: { storages: [{ code: 2000 }] },
      })

      expect(result.success).toBe(false)
    })
  })

  it('rejects a product without id', () => {
    expect(productDetailSchema.safeParse({ brand: 'Acer' }).success).toBe(false)
  })
})

describe('cartResponseSchema', () => {
  it.each([0, 1, 42])('accepts a count of %j', (count) => {
    expect(cartResponseSchema.parse({ count })).toEqual({ count })
  })

  it.each([-1, 1.5, '3', null, undefined])('rejects a count of %j', (count) => {
    expect(cartResponseSchema.safeParse({ count }).success).toBe(false)
  })

  it('rejects a response without count', () => {
    expect(cartResponseSchema.safeParse({}).success).toBe(false)
  })
})
