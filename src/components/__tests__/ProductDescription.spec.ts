import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { productDetailSchema } from '@/api/schemas'
import details from '@/api/__tests__/fixtures/product-details.json'
import ProductDescription from '../ProductDescription.vue'

const product = productDetailSchema.parse(details.normal)
const withoutData = productDetailSchema.parse(details.sinPrecio)

function valueOf(wrapper: ReturnType<typeof mountDescription>, label: string) {
  const index = wrapper.findAll('dt').findIndex((term) => term.text() === label)
  return wrapper.findAll('dd')[index]?.text()
}

function mountDescription(item = product) {
  return mount(ProductDescription, { props: { product: item } })
}

describe('ProductDescription', () => {
  it.each([
    ['Brand', 'Acer'],
    ['Model', 'Iconia Talk S'],
    ['Price', '€170'],
    ['CPU', 'Quad-core 1.3 GHz Cortex-A53'],
    ['RAM', '2 GB RAM'],
    ['Operating system', 'Android 6.0 (Marshmallow)'],
    ['Screen size', '7.0 inches (~69.8% screen-to-body ratio)'],
    ['Screen resolution', '720 x 1280 pixels (~210 ppi pixel density)'],
    ['Battery', 'Non-removable Li-Ion 3400 mAh battery (12.92 Wh)'],
    ['Primary camera', '13 MP, autofocus'],
    ['Secondary camera', '2 MP, 720p'],
    ['Dimensions', '191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)'],
    ['Weight', '260 g'],
  ])('shows the %s of the product: %s', (label, expected) => {
    const wrapper = mountDescription()

    expect(valueOf(wrapper, label)).toBe(expected)
  })

  it('shows a dash for the data that is missing', () => {
    const wrapper = mountDescription(withoutData)

    expect(valueOf(wrapper, 'Weight')).toBe('—')
    expect(valueOf(wrapper, 'Dimensions')).toBe('—')
  })

  it('tells that the price is not available when there is none', () => {
    const wrapper = mountDescription(withoutData)

    expect(valueOf(wrapper, 'Price')).toBe('Not available')
  })

  it('shows a dash when the brand, the model or a specification is missing', () => {
    const wrapper = mountDescription({ ...product, brand: null, model: null, ram: null })

    expect(valueOf(wrapper, 'Brand')).toBe('—')
    expect(valueOf(wrapper, 'Model')).toBe('—')
    expect(valueOf(wrapper, 'RAM')).toBe('—')
  })

  it('shows every attribute, each one with its label', () => {
    const wrapper = mountDescription()

    expect(wrapper.findAll('dt')).toHaveLength(13)
    expect(wrapper.findAll('dd')).toHaveLength(13)
  })
})
