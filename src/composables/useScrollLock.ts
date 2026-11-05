import { onBeforeUnmount, watch, type Ref } from 'vue'

let locks = 0
let previousOverflow = ''

function lock() {
  if (locks++ === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
}

function unlock() {
  if (locks > 0 && --locks === 0) document.body.style.overflow = previousOverflow
}

export function useScrollLock(locked: Ref<boolean>) {
  let holding = false

  function sync(value: boolean) {
    if (value === holding) return
    holding = value
    if (value) lock()
    else unlock()
  }

  watch(locked, sync, { immediate: true })
  onBeforeUnmount(() => sync(false))
}
