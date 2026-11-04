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

  it('titles the description with the brand and the model', () => {
    const wrapper = mountDescription()

    expect(wrapper.get('h1').text()).toBe('Acer Iconia Talk S')
  })

  it('uses a generic title when the product has neither brand nor model', () => {
    const wrapper = mountDescription({ ...product, brand: null, model: null })

    expect(wrapper.get('h1').text()).toBe('Product')
  })

  it('shows the price of the product', () => {
    const wrapper = mountDescription()

    expect(wrapper.get('.price').text()).toBe('€170')
  })

  it('tells that the price is not available when there is none', () => {
    const wrapper = mountDescription(withoutData)

    expect(wrapper.get('.price').text()).toBe('Not available')
  })

  it('shows a dash when a specification is missing', () => {
    const wrapper = mountDescription({ ...product, ram: null })

    expect(valueOf(wrapper, 'RAM')).toBe('—')
  })

  it('shows every specification, each one with its label', () => {
    const wrapper = mountDescription()

    expect(wrapper.findAll('dt')).toHaveLength(10)
    expect(wrapper.findAll('dd')).toHaveLength(10)
  })

  describe('see more', () => {
    const rowOf = (wrapper: ReturnType<typeof mountDescription>, label: string) =>
      wrapper.findAll('.row').find((row) => row.get('dt').text() === label)!

    it('shows the main specifications and hides the rest at first', () => {
      const wrapper = mountDescription()

      for (const label of ['CPU', 'RAM', 'Screen size', 'Battery', 'Primary camera']) {
        expect(rowOf(wrapper, label).attributes('hidden')).toBeUndefined()
      }
      for (const label of [
        'Operating system',
        'Screen resolution',
        'Secondary camera',
        'Dimensions',
        'Weight',
      ]) {
        expect(rowOf(wrapper, label).attributes('hidden')).toBeDefined()
      }
    })

    it('tells how many specifications it can show', () => {
      const wrapper = mountDescription()

      expect(wrapper.get('button').text()).toBe('Show 5 more')
      expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
    })

    it('shows every specification when the button is pressed', async () => {
      const wrapper = mountDescription()

      await wrapper.get('button').trigger('click')

      expect(wrapper.findAll('.row').every((row) => row.attributes('hidden') === undefined)).toBe(
        true,
      )
      expect(wrapper.get('button').text()).toBe('Show fewer')
      expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    })

    it('hides the extra specifications again when the button is pressed twice', async () => {
      const wrapper = mountDescription()

      await wrapper.get('button').trigger('click')
      await wrapper.get('button').trigger('click')

      expect(rowOf(wrapper, 'Weight').attributes('hidden')).toBeDefined()
    })

    it('controls the list of specifications', () => {
      const wrapper = mountDescription()

      expect(wrapper.get('button').attributes('aria-controls')).toBe(
        wrapper.get('dl').attributes('id'),
      )
    })
  })
})
