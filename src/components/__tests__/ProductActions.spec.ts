import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { api } from '@/api'
import type { Api } from '@/api/client'
import { productDetailSchema, type ProductDetail } from '@/api/schemas'
import details from '@/api/__tests__/fixtures/product-details.json'
import { useCartStore } from '@/stores/cart'
import ProductActions from '../ProductActions.vue'

vi.mock('@/api', () => ({ api: { addToCart: vi.fn<Api['addToCart']>() } }))

const addToCart = vi.mocked(api.addToCart)

const twoStorages = productDetailSchema.parse(details.normal)
const singleOptions = productDetailSchema.parse(details.sinPrecio)
const manyColors = productDetailSchema.parse(details.muchosColores)
const noOptions: ProductDetail = { ...twoStorages, options: { colors: [], storages: [] } }

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function mountActions(product: ProductDetail = twoStorages) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(ProductActions, { props: { product }, global: { plugins: [pinia] } })
  return { wrapper, cart: useCartStore() }
}

type Wrapper = ReturnType<typeof mountActions>['wrapper']

function group(wrapper: Wrapper, legend: string) {
  return wrapper.findAll('fieldset').find((fieldset) => fieldset.get('legend').text() === legend)!
}

function radio(wrapper: Wrapper, legend: string, name: string) {
  const label = group(wrapper, legend)
    .findAll('label')
    .find((item) => item.text() === name)!
  return label.get<HTMLInputElement>('input')
}

const button = (wrapper: Wrapper) => wrapper.get<HTMLButtonElement>('button')

beforeEach(() => {
  addToCart.mockReset()
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ProductActions', () => {
  describe('options', () => {
    it('shows a group for the storage and another for the color', () => {
      const { wrapper } = mountActions()

      expect(
        group(wrapper, 'Storage')
          .findAll('label')
          .map((item) => item.text()),
      ).toEqual(['16 GB', '32 GB'])
      expect(
        group(wrapper, 'Color')
          .findAll('label')
          .map((item) => item.text()),
      ).toEqual(['Black'])
    })

    it('selects an option by default when it is the only one', () => {
      const { wrapper } = mountActions()

      expect(radio(wrapper, 'Color', 'Black').element.checked).toBe(true)
    })

    it('leaves the choice to the user when there are several options', () => {
      const { wrapper } = mountActions()

      expect(radio(wrapper, 'Storage', '16 GB').element.checked).toBe(false)
      expect(radio(wrapper, 'Storage', '32 GB').element.checked).toBe(false)
    })

    it('tells that there are no options when the product has none', () => {
      const { wrapper } = mountActions(noOptions)

      expect(wrapper.text()).toContain('No options available')
      expect(button(wrapper).element.disabled).toBe(true)
    })

    it('starts again from the options of another product when it changes', async () => {
      const { wrapper } = mountActions(singleOptions)
      expect(radio(wrapper, 'Storage', '32 GB').element.checked).toBe(true)

      await wrapper.setProps({ product: manyColors })

      expect(radio(wrapper, 'Storage', '512 MB').element.checked).toBe(true)
      for (const input of group(wrapper, 'Color').findAll<HTMLInputElement>('input')) {
        expect(input.element.checked).toBe(false)
      }
    })
  })

  describe('add button', () => {
    it('is disabled until every group has a selection', async () => {
      const { wrapper } = mountActions()
      expect(button(wrapper).element.disabled).toBe(true)

      await radio(wrapper, 'Storage', '32 GB').setValue(true)

      expect(button(wrapper).element.disabled).toBe(false)
    })

    it('is enabled at once when each group has a single option', () => {
      const { wrapper } = mountActions(singleOptions)

      expect(button(wrapper).element.disabled).toBe(false)
    })

    it('sends the product and the selected codes to the cart', async () => {
      addToCart.mockResolvedValue(1)
      const { wrapper } = mountActions()
      await radio(wrapper, 'Storage', '32 GB').setValue(true)

      await wrapper.get('form').trigger('submit')

      expect(addToCart).toHaveBeenCalledWith({
        id: twoStorages.id,
        colorCode: twoStorages.options.colors[0]!.code,
        storageCode: 2001,
      })
    })

    it('does not send anything while the selection is incomplete', async () => {
      const { wrapper } = mountActions()

      await wrapper.get('form').trigger('submit')

      expect(addToCart).not.toHaveBeenCalled()
    })

    it('updates the cart with the count that the api returns', async () => {
      addToCart.mockResolvedValue(4)
      const { wrapper, cart } = mountActions(singleOptions)

      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(cart.count).toBe(4)
    })
  })

  describe('while adding', () => {
    it('shows that it is adding and blocks the button until the api answers', async () => {
      const pending = deferred<number>()
      addToCart.mockReturnValue(pending.promise)
      const { wrapper } = mountActions(singleOptions)

      await wrapper.get('form').trigger('submit')

      expect(button(wrapper).text()).toBe('Adding…')
      expect(button(wrapper).element.disabled).toBe(true)

      pending.resolve(1)
      await flushPromises()

      expect(button(wrapper).text()).toBe('Add to cart')
      expect(button(wrapper).element.disabled).toBe(false)
    })

    it('does not send a second request while one is in progress', async () => {
      addToCart.mockReturnValue(new Promise(() => {}))
      const { wrapper } = mountActions(singleOptions)

      await wrapper.get('form').trigger('submit')
      await wrapper.get('form').trigger('submit')

      expect(addToCart).toHaveBeenCalledTimes(1)
    })
  })

  describe('result', () => {
    it('confirms that the product was added', async () => {
      addToCart.mockResolvedValue(1)
      const { wrapper } = mountActions(singleOptions)

      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(wrapper.get('[role="status"]').text()).toBe('Added to cart')
    })

    it('tells that it could not add the product and lets the user try again', async () => {
      addToCart.mockRejectedValue(new Error('network down'))
      const { wrapper } = mountActions(singleOptions)

      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(wrapper.get('[role="alert"]').text()).toBe(
        'Could not add the product. Please try again.',
      )
      expect(button(wrapper).element.disabled).toBe(false)
    })

    it('keeps the selection after adding the product', async () => {
      addToCart.mockResolvedValue(1)
      const { wrapper } = mountActions()
      await radio(wrapper, 'Storage', '32 GB').setValue(true)

      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(radio(wrapper, 'Storage', '32 GB').element.checked).toBe(true)
    })

    it('clears the message when the user changes the selection', async () => {
      addToCart.mockResolvedValue(1)
      const { wrapper } = mountActions()
      await radio(wrapper, 'Storage', '32 GB').setValue(true)
      await wrapper.get('form').trigger('submit')
      await flushPromises()

      await radio(wrapper, 'Storage', '16 GB').setValue(true)

      expect(wrapper.find('[role="status"]').text()).toBe('')
    })

    it('clears the message when the user adds the product again', async () => {
      addToCart.mockResolvedValueOnce(1)
      const { wrapper } = mountActions(singleOptions)
      await wrapper.get('form').trigger('submit')
      await flushPromises()
      addToCart.mockReturnValueOnce(new Promise(() => {}))

      await wrapper.get('form').trigger('submit')

      expect(wrapper.find('[role="status"]').text()).toBe('')
    })
  })
})
