import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref, type Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useScrollLock } from '../useScrollLock'

const mounted: { unmount: () => void }[] = []

function mountLock(locked: Ref<boolean>) {
  const Probe = defineComponent({
    setup() {
      useScrollLock(locked)
      return () => h('p')
    },
  })
  const wrapper = mount(Probe)
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.style.overflow = ''
})

describe('useScrollLock', () => {
  it('stops the page from scrolling while it is locked', async () => {
    const locked = ref(false)
    mountLock(locked)
    expect(document.body.style.overflow).toBe('')

    locked.value = true
    await nextTick()

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('lets the page scroll again when it is unlocked', async () => {
    const locked = ref(true)
    mountLock(locked)

    locked.value = false
    await nextTick()

    expect(document.body.style.overflow).toBe('')
  })

  it('gives back the value the page had before it was locked', async () => {
    document.body.style.overflow = 'scroll'
    const locked = ref(true)
    mountLock(locked)
    expect(document.body.style.overflow).toBe('hidden')

    locked.value = false
    await nextTick()

    expect(document.body.style.overflow).toBe('scroll')
  })

  it('keeps the page locked until the last owner of a lock lets it go', async () => {
    const first = ref(true)
    const second = ref(true)
    mountLock(first)
    mountLock(second)

    first.value = false
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    second.value = false
    await nextTick()
    expect(document.body.style.overflow).toBe('')
  })

  it('lets the page scroll again when it is removed while locked', () => {
    const wrapper = mountLock(ref(true))
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()

    expect(document.body.style.overflow).toBe('')
  })
})
