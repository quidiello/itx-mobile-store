<script setup lang="ts">
import { computed, nextTick, ref, useId, useTemplateRef, watch } from 'vue'
import type { ProductDetail, ProductOption } from '@/api/schemas'
import { useCartStore } from '@/stores/cart'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useScrollLock } from '@/composables/useScrollLock'
import { formatPrice } from '@/utils/formatPrice'
import ChevronIcon from './icons/ChevronIcon.vue'

const props = defineProps<{ product: ProductDetail }>()

const cart = useCartStore()

const storageCode = ref<number | null>(null)
const colorCode = ref<number | null>(null)
const adding = ref(false)
const result = ref<'added' | 'failed' | null>(null)
const sheetOpen = ref(false)
const optionsId = useId()
const trigger = useTemplateRef('trigger')
const options = useTemplateRef('options')
const narrow = useMediaQuery('(max-width: 40rem)')

const hasOptions = computed(
  () => props.product.options.storages.length > 0 && props.product.options.colors.length > 0,
)
const summary = computed(() =>
  [
    props.product.options.storages.find((option) => option.code === storageCode.value)?.name,
    props.product.options.colors.find((option) => option.code === colorCode.value)?.name,
  ]
    .filter(Boolean)
    .join(' · '),
)
const hasPrice = computed(() => props.product.price !== null)
const canAdd = computed(
  () => hasPrice.value && storageCode.value !== null && colorCode.value !== null,
)

function firstOption(options: ProductOption[]) {
  return options[0]?.code ?? null
}

watch(
  () => props.product,
  (product) => {
    storageCode.value = firstOption(product.options.storages)
    colorCode.value = firstOption(product.options.colors)
    sheetOpen.value = false
  },
  { immediate: true },
)

watch([storageCode, colorCode, () => props.product], () => {
  result.value = null
})

watch(narrow, (isNarrow) => {
  if (!isNarrow) sheetOpen.value = false
})

useScrollLock(sheetOpen)

async function openSheet() {
  sheetOpen.value = true
  await nextTick()
  options.value?.querySelector<HTMLInputElement>('input:checked')?.focus()
}

function closeSheet() {
  sheetOpen.value = false
  trigger.value?.focus()
}

// While the sheet is open the focus wraps around inside it.
function trapFocus(event: KeyboardEvent) {
  if (!sheetOpen.value || !options.value) return

  const stops = [...options.value.querySelectorAll<HTMLElement>('input:checked, button')]
  const first = stops[0]
  const last = stops[stops.length - 1]
  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

async function add() {
  if (!hasPrice.value || storageCode.value === null || colorCode.value === null) return
  if (adding.value) return

  adding.value = true
  result.value = null
  try {
    await cart.add({
      id: props.product.id,
      colorCode: colorCode.value,
      storageCode: storageCode.value,
    })
    result.value = 'added'
  } catch {
    result.value = 'failed'
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <form @submit.prevent="add">
    <div v-if="sheetOpen" class="backdrop" @click="closeSheet" />

    <div
      :id="optionsId"
      ref="options"
      class="options"
      :class="{ open: sheetOpen }"
      :role="narrow ? 'dialog' : undefined"
      :aria-modal="narrow && sheetOpen ? 'true' : undefined"
      :aria-label="narrow ? 'Choose options' : undefined"
      @keydown.esc="closeSheet"
      @keydown.tab="trapFocus"
    >
      <span class="grab" aria-hidden="true" />

      <fieldset>
        <legend>Storage</legend>
        <label v-for="option in product.options.storages" :key="option.code">
          <input v-model="storageCode" type="radio" name="storage" :value="option.code" />
          {{ option.name }}
        </label>
      </fieldset>

      <fieldset>
        <legend>Color</legend>
        <label v-for="option in product.options.colors" :key="option.code">
          <input v-model="colorCode" type="radio" name="color" :value="option.code" />
          {{ option.name }}
        </label>
      </fieldset>

      <p v-if="!hasOptions">No options available</p>

      <button type="button" class="done" @click="closeSheet">Done</button>
    </div>

    <div class="buy">
      <div class="messages">
        <p role="status">{{ result === 'added' ? 'Added to cart' : '' }}</p>
        <p v-if="result === 'failed'" role="alert">Could not add the product. Please try again.</p>
      </div>
      <button
        ref="trigger"
        type="button"
        class="summary"
        aria-haspopup="dialog"
        :aria-expanded="sheetOpen"
        :aria-controls="optionsId"
        @click="openSheet"
      >
        <span class="sr-only">Change options, </span>
        <strong>{{ formatPrice(product.price) }}</strong>
        <span class="choice">
          {{ summary }}
          <ChevronIcon direction="up" :size="14" />
        </span>
      </button>
      <button type="submit" class="submit" :disabled="!canAdd || adding">
        {{ adding ? 'Adding…' : hasPrice ? 'Add to cart' : 'Not available' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
fieldset {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0 0 var(--space-4);
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: var(--space-2);
  padding: 0;
  font-size: var(--text-sm);
  font-weight: 600;
}

fieldset label {
  position: relative;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border-control);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

fieldset label:hover {
  border-color: var(--color-accent);
}

fieldset label:has(input:checked) {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}

fieldset label:has(input:focus-visible) {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

fieldset input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.summary,
.done,
.grab,
.backdrop {
  display: none;
}

.submit {
  width: 100%;
  margin-top: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-pill);
}

[role='status'] {
  margin: var(--space-3) 0 0;
  color: var(--color-success);
  font-size: var(--text-sm);
  font-weight: 500;
}

[role='status']:empty {
  margin: 0;
}

@media (max-width: 40rem) {
  .buy {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4) max(var(--space-3), env(safe-area-inset-bottom));
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .summary {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    padding: 0;
    border-radius: 0;
    background: none;
    color: var(--color-text);
    font-size: var(--text-xs);
    font-weight: 400;
    text-align: left;
  }

  .summary:hover:not(:disabled) {
    background: none;
    color: var(--color-text);
  }

  .summary strong {
    font-size: var(--text-lg);
    line-height: 1.2;
  }

  .summary .choice {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    max-width: 100%;
    color: var(--color-accent);
    font-weight: 600;
  }

  .submit {
    flex: none;
    width: auto;
    min-width: 9.5rem;
    margin-top: 0;
  }

  .messages {
    position: absolute;
    right: var(--space-4);
    bottom: 100%;
    left: var(--space-4);
    margin-bottom: var(--space-2);
  }

  [role='status'] {
    margin: 0;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    box-shadow: var(--shadow-md);
    text-align: center;
  }

  [role='status']:empty {
    display: none;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: block;
    background: rgb(17 24 39 / 40%);
  }

  .options {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
    padding: var(--space-3) var(--space-5) max(var(--space-5), env(safe-area-inset-bottom));
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    background: var(--color-surface);
    box-shadow: var(--shadow-md);
    visibility: hidden;
    transform: translateY(100%);
    transition:
      transform 0.25s ease,
      visibility 0.25s;
  }

  .options.open {
    visibility: visible;
    transform: none;
  }

  .grab {
    display: block;
    width: 2rem;
    height: 4px;
    margin: 0 auto var(--space-4);
    border-radius: 2px;
    background: var(--color-border-strong);
  }

  .done {
    display: block;
    width: 100%;
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-pill);
  }
}
</style>
