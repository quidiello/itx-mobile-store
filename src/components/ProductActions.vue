<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProductDetail, ProductOption } from '@/api/schemas'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/formatPrice'

const props = defineProps<{ product: ProductDetail }>()

const cart = useCartStore()

const storageCode = ref<number | null>(null)
const colorCode = ref<number | null>(null)
const adding = ref(false)
const result = ref<'added' | 'failed' | null>(null)

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
  },
  { immediate: true },
)

watch([storageCode, colorCode, () => props.product], () => {
  result.value = null
})

async function add() {
  if (storageCode.value === null || colorCode.value === null || adding.value) return

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

    <div class="buy">
      <div class="messages">
        <p role="status">{{ result === 'added' ? 'Added to cart' : '' }}</p>
        <p v-if="result === 'failed'" role="alert">Could not add the product. Please try again.</p>
      </div>
      <div class="summary" aria-hidden="true">
        <strong>{{ formatPrice(product.price) }}</strong>
        <span>{{ summary }}</span>
      </div>
      <button type="submit" :disabled="!canAdd || adding">
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
  border: 1px solid var(--color-border);
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

.summary {
  display: none;
}

button {
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
    flex-direction: column;
    min-width: 0;
    font-size: var(--text-xs);
  }

  .summary strong {
    font-size: var(--text-lg);
    line-height: 1.2;
  }

  .summary span {
    overflow: hidden;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  button {
    flex: 1;
    width: auto;
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
}
</style>
