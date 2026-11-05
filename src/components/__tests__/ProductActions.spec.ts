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
const withoutPrice = productDetailSchema.parse(details.sinPrecio)
const singleOptions: ProductDetail = { ...withoutPrice, price: 100 }
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

const button = (wrapper: Wrapper) => wrapper.get<HTMLButtonElement>('button[type="submit"]')

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

    it('selects the first option by default when there are several', () => {
      const { wrapper } = mountActions()

      expect(radio(wrapper, 'Storage', '16 GB').element.checked).toBe(true)
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
      expect(radio(wrapper, 'Color', 'blue').element.checked).toBe(true)
      expect(radio(wrapper, 'Color', 'pink').element.checked).toBe(false)
    })
  })

  describe('add button', () => {
    it('is enabled at once because each group starts with an option selected', () => {
      const { wrapper } = mountActions()

      expect(button(wrapper).element.disabled).toBe(false)
    })

    it('is disabled and says so when the product has no price', () => {
      const { wrapper } = mountActions(withoutPrice)

      expect(button(wrapper).element.disabled).toBe(true)
      expect(button(wrapper).text()).toBe('Not available')
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

    it('sends the first options when the user does not change anything', async () => {
      addToCart.mockResolvedValue(1)
      const { wrapper } = mountActions()

      await wrapper.get('form').trigger('submit')

      expect(addToCart).toHaveBeenCalledWith({
        id: twoStorages.id,
        colorCode: twoStorages.options.colors[0]!.code,
        storageCode: 2000,
      })
    })

    it('does not send anything when the product has no options to choose', async () => {
      const { wrapper } = mountActions(noOptions)

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

  describe('summary of the purchase', () => {
    const summaryOf = (wrapper: Wrapper) => wrapper.get('.summary')

    it('shows the price and the selected options', () => {
      const { wrapper } = mountActions()

      expect(summaryOf(wrapper).get('strong').text()).toBe('€170')
      expect(summaryOf(wrapper).get('.choice').text()).toBe('16 GB · Black')
    })

    it('shows the new options when the user changes the selection', async () => {
      const { wrapper } = mountActions()

      await radio(wrapper, 'Storage', '32 GB').setValue(true)

      expect(summaryOf(wrapper).get('.choice').text()).toBe('32 GB · Black')
    })

    it('tells that the price is not available when there is none', () => {
      const { wrapper } = mountActions(withoutPrice)

      expect(summaryOf(wrapper).get('strong').text()).toBe('Not available')
    })
  })

  describe('options sheet on narrow screens', () => {
    const optionsOf = (wrapper: Wrapper) => wrapper.get('.options')

    it('starts closed', () => {
      const { wrapper } = mountActions()

      expect(optionsOf(wrapper).classes()).not.toContain('open')
      expect(wrapper.get('.summary').attributes('aria-expanded')).toBe('false')
    })

    it('opens when the summary is pressed', async () => {
      const { wrapper } = mountActions()

      await wrapper.get('.summary').trigger('click')

      expect(optionsOf(wrapper).classes()).toContain('open')
      expect(wrapper.get('.summary').attributes('aria-expanded')).toBe('true')
      expect(wrapper.find('.backdrop').exists()).toBe(true)
    })

    it('points the summary at the options it opens', () => {
      const { wrapper } = mountActions()

      expect(wrapper.get('.summary').attributes('aria-controls')).toBe(
        optionsOf(wrapper).attributes('id'),
      )
    })

    it('closes when Done is pressed', async () => {
      const { wrapper } = mountActions()
      await wrapper.get('.summary').trigger('click')

      await wrapper.get('.done').trigger('click')

      expect(optionsOf(wrapper).classes()).not.toContain('open')
      expect(wrapper.find('.backdrop').exists()).toBe(false)
    })

    it('closes when the user presses Escape', async () => {
      const { wrapper } = mountActions()
      await wrapper.get('.summary').trigger('click')

      await optionsOf(wrapper).trigger('keydown', { key: 'Escape' })

      expect(optionsOf(wrapper).classes()).not.toContain('open')
    })

    it('closes when the user presses the backdrop', async () => {
      const { wrapper } = mountActions()
      await wrapper.get('.summary').trigger('click')

      await wrapper.get('.backdrop').trigger('click')

      expect(optionsOf(wrapper).classes()).not.toContain('open')
    })

    it('keeps the choice made inside the sheet', async () => {
      const { wrapper } = mountActions()
      await wrapper.get('.summary').trigger('click')

      await radio(wrapper, 'Storage', '32 GB').setValue(true)
      await wrapper.get('.done').trigger('click')

      expect(wrapper.get('.summary .choice').text()).toBe('32 GB · Black')
    })

    it('closes when another product is shown', async () => {
      const { wrapper } = mountActions()
      await wrapper.get('.summary').trigger('click')

      await wrapper.setProps({ product: manyColors })

      expect(optionsOf(wrapper).classes()).not.toContain('open')
    })

    it('releases the scroll of the page when it is removed while open', async () => {
      const { wrapper } = mountActions()
      await wrapper.get('.summary').trigger('click')
      expect(document.body.style.overflow).toBe('hidden')

      wrapper.unmount()

      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('accessibility of the options sheet', () => {
    const optionsOf = (wrapper: Wrapper) => wrapper.get('.options')

    function stubScreen(narrow: boolean) {
      vi.stubGlobal('matchMedia', () => ({
        matches: narrow,
        addEventListener: () => {},
        removeEventListener: () => {},
      }))
    }

    it('closes the sheet and frees the scroll when the screen stops being narrow', async () => {
      let listener: () => void = () => {}
      const list = {
        matches: true,
        addEventListener: (_event: string, callback: () => void) => {
          listener = callback
        },
        removeEventListener: () => {},
      }
      vi.stubGlobal('matchMedia', () => list)
      const { wrapper } = mountActions()
      await wrapper.vm.$nextTick()
      await wrapper.get('.summary').trigger('click')
      expect(document.body.style.overflow).toBe('hidden')

      list.matches = false
      listener()
      await wrapper.vm.$nextTick()

      expect(optionsOf(wrapper).classes()).not.toContain('open')
      expect(document.body.style.overflow).toBe('')
    })

    it('does not add a product without price even if the form is submitted', async () => {
      const { wrapper } = mountActions(withoutPrice)

      await wrapper.get('form').trigger('submit')

      expect(addToCart).not.toHaveBeenCalled()
    })

    it('announces what the summary button does', () => {
      const { wrapper } = mountActions()

      expect(wrapper.get('.summary').text()).toContain('Change options')
      expect(wrapper.get('.summary').attributes('aria-haspopup')).toBe('dialog')
    })

    it('is a modal dialog with a name on narrow screens while it is open', async () => {
      stubScreen(true)
      const { wrapper } = mountActions()
      await wrapper.vm.$nextTick()

      await wrapper.get('.summary').trigger('click')

      expect(optionsOf(wrapper).attributes('role')).toBe('dialog')
      expect(optionsOf(wrapper).attributes('aria-modal')).toBe('true')
      expect(optionsOf(wrapper).attributes('aria-label')).toBe('Choose options')
    })

    it('is not marked as modal while it is closed', async () => {
      stubScreen(true)
      const { wrapper } = mountActions()
      await wrapper.vm.$nextTick()

      expect(optionsOf(wrapper).attributes('aria-modal')).toBeUndefined()
    })

    it('is an ordinary part of the page on wide screens', async () => {
      stubScreen(false)
      const { wrapper } = mountActions()
      await wrapper.vm.$nextTick()

      expect(optionsOf(wrapper).attributes('role')).toBeUndefined()
      expect(optionsOf(wrapper).attributes('aria-label')).toBeUndefined()
    })

    describe('keyboard', () => {
      const mounted: Wrapper[] = []

      function mountAttached() {
        const pinia = createPinia()
        setActivePinia(pinia)
        const wrapper = mount(ProductActions, {
          props: { product: twoStorages },
          global: { plugins: [pinia] },
          attachTo: document.body,
        })
        mounted.push(wrapper)
        return wrapper
      }

      afterEach(() => {
        mounted.splice(0).forEach((wrapper) => wrapper.unmount())
      })

      function press(wrapper: Wrapper, init: KeyboardEventInit) {
        return optionsOf(wrapper).trigger('keydown', { key: 'Tab', ...init })
      }

      it('goes back to the first option when Tab leaves the last control', async () => {
        const wrapper = mountAttached()
        await wrapper.get('.summary').trigger('click')
        const first = radio(wrapper, 'Storage', '16 GB').element
        wrapper.get<HTMLButtonElement>('.done').element.focus()

        await press(wrapper, {})

        expect(document.activeElement).toBe(first)
      })

      it('goes to the Done button when Shift+Tab leaves the first option', async () => {
        const wrapper = mountAttached()
        await wrapper.get('.summary').trigger('click')
        radio(wrapper, 'Storage', '16 GB').element.focus()

        await press(wrapper, { shiftKey: true })

        expect(document.activeElement).toBe(wrapper.get('.done').element)
      })

      it('lets Tab move on normally in the middle of the sheet', async () => {
        const wrapper = mountAttached()
        await wrapper.get('.summary').trigger('click')
        const middle = radio(wrapper, 'Color', 'Black').element
        middle.focus()

        await press(wrapper, {})

        expect(document.activeElement).toBe(middle)
      })

      it('does not hold the focus when the sheet is closed', async () => {
        const wrapper = mountAttached()
        const done = wrapper.get<HTMLButtonElement>('.done').element
        done.focus()

        await press(wrapper, {})

        expect(document.activeElement).toBe(done)
      })
    })
  })
})
